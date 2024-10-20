package webserver

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func authMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := sessionUser(c)
		if err != nil || user == nil || user.ID == 0 {
			return c.JSON(http.StatusUnauthorized, errMsg("Unauthorized"))
		}

		return next(c)
	}
}
