package webserver

import (
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

var (
	// Not a proper key
	secret = []byte("0123456789ABCDEF")
)

func sessionUser(c echo.Context) (*User, error) {
	for k, v := range c.Request().Header {
		if k == "Authorization" && len(v) > 0 {
			user, err := validateClaims(strings.TrimPrefix(v[0], "Bearer "))
			if err != nil {
				return nil, err
			}
			return user, nil
		}
	}

	return nil, errors.New("No authorization header")
}

func checkPassword(username, password string) bool {
	user, err := getUser(username)
	if err != nil {
		return false
	}

	err = bcrypt.CompareHashAndPassword(user.Password, []byte(password))
	return err == nil
}

func hashPassword(password string) ([]byte, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return hash, nil
}

func createClaims(auth *UserAuth) (string, error) {
	user, err := getUser(auth.Username)
	if err != nil {
		return "", err
	}

	user.RegisteredClaims = jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "wiki-be",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, user)
	ss, err := token.SignedString(secret)
	if err != nil {
		return "", err
	}

	return ss, nil
}

func validateClaims(ss string) (*User, error) {
	token, err := jwt.ParseWithClaims(ss, &User{}, jwtKey)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*User)
	if !ok {
		return nil, errors.New("invalid auth token")
	}

	return claims, nil
}

func jwtKey(token *jwt.Token) (interface{}, error) {
	return secret, nil
}
