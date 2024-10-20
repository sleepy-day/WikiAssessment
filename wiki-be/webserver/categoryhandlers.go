package webserver

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func getCategories(c echo.Context) error {
	categories, err := getAllCategories()
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, errMsg("error getting categories"))
	}

	return c.JSON(http.StatusOK, categories)
}

func createCategory(c echo.Context) error {
	var category Category
	err := c.Bind(&category)
	if err != nil {
		return c.JSON(http.StatusBadRequest, errMsg("Error binding category form: %s", err.Error()))
	}

	category.Name = strings.Trim(category.Name, " ")

	if category.Name == "" {
		return c.JSON(http.StatusBadRequest, errMsg("No category name has been submitted"))
	}

	existingCategory, err := getCategory(category.Name)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errMsg("Error creating category"))
	}

	if existingCategory != nil {
		return c.JSON(http.StatusConflict, errMsg("Category already exists with this name"))
	}

	err = insertCategory(category.Name)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errMsg("Error creating category"))
	}

	return c.JSON(http.StatusOK, resMsg("Category created", nil))
}
