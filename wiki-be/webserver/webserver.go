package webserver

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func StartServer() {
	e := echo.New()
	e.Use(middleware.Recover())
	e.Use(middleware.RemoveTrailingSlash())
	e.Use(middleware.CORS())

	e.POST("/register", register)
	e.POST("/login", login)

	g := e.Group("/api")
	g.Use(authMiddleware)

	g.GET("/category/list", getCategories)
	g.GET("/category/:Category", getPagesForCategory)
	g.GET("/page/:Page/:Category", getPageByNameAndCategory)
	g.GET("/page/:Page", getPageByName)
	g.GET("/pagehistory/:Page/:Category/:Version", getPageContentByVersion)
	g.GET("/pagehistory/:Page/:Category", getPageVersions)
	g.GET("/pagehistory/:Page", getPageVersions)
	g.POST("/page/content", getPageContent)
	g.POST("/page/update", postUpdatePage)
	g.POST("/category/create", createCategory)

	e.Start(":8080")
}
