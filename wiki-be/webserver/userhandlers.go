package webserver

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func register(c echo.Context) error {
	var auth UserAuth
	err := c.Bind(&auth)
	if err != nil {
		return c.JSON(http.StatusBadRequest, errMsg("Error binding registration form: %s", err.Error()))
	}

	auth.Username = strings.Trim(auth.Username, " ")
	auth.Password = strings.Trim(auth.Password, " ")

	if auth.Username == "" || auth.Password == "" {
		return c.JSON(http.StatusBadRequest, errMsg("Username or password is empty"))
	}

	user, _ := getUser(auth.Username)
	if user != nil {
		return c.JSON(http.StatusBadRequest, errMsg("User already exists"))
	}

	hash, err := hashPassword(auth.Password)
	if err != nil {
		return c.JSON(http.StatusBadRequest, errMsg("Error creating account"))
	}

	err = createUser(auth.Username, hash)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errMsg("Error creating account"))
	}

	return c.JSON(http.StatusOK, resMsg("Account created, please sign in.", nil))
}

func login(c echo.Context) error {
	var auth UserAuth
	err := c.Bind(&auth)
	if err != nil {
		return c.JSON(http.StatusBadRequest, errMsg("Error binding login form: %s", err.Error()))
	}

	if !checkPassword(auth.Username, auth.Password) {
		return c.JSON(http.StatusUnauthorized, errMsg("Invalid username or password"))
	}

	jwtString, err := createClaims(&auth)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errMsg("Error signing in."))
	}

	return c.JSON(http.StatusOK, struct {
		Token string `json:"token"`
	}{
		Token: jwtString,
	})
}
