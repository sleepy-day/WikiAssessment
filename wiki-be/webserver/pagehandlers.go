package webserver

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

func getPagesForCategory(c echo.Context) error {
	categoryName := c.Param("Category")
	if categoryName == "" {
		return c.JSON(http.StatusNotFound, errMsg("No category submitted"))
	}

	pages, err := getPagesByCategory(categoryName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errMsg("Error getting pages for this category"))
	}

	return c.JSON(http.StatusOK, pages)
}

func getPageByName(c echo.Context) error {
	pageName := c.Param("Page")
	if pageName == "" {
		return c.JSON(http.StatusNotFound, errMsg("No page found"))
	}

	pages, err := getPagesByName(pageName)
	if err != nil {
		fmt.Println("Err1: ", err.Error())
		return c.JSON(http.StatusInternalServerError, errMsg("Error getting page"))
	}

	return c.JSON(http.StatusOK, pages)
}

func getPageByNameAndCategory(c echo.Context) error {
	pageName := c.Param("Page")
	categoryName := c.Param("Category")
	if pageName == "" || categoryName == "" {
		return c.JSON(http.StatusNotFound, errMsg("No page found"))
	}

	page, err := selectPageByNameAndCategory(pageName, categoryName)
	if err != nil || page == nil {
		return c.JSON(http.StatusNotFound, errMsg("No page found"))
	}

	return c.JSON(http.StatusOK, page)
}

func getPageContent(c echo.Context) error {
	var pageID PageID
	err := c.Bind(&pageID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, errMsg("Invalid request: invalid form submitted"))
	}

	content, err := getPageContentByID(pageID.ID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, errMsg("Unable to get page content for ID"))
	}

	return c.JSON(http.StatusOK, content)
}

func postUpdatePage(c echo.Context) error {
	var form PageForm
	err := c.Bind(&form)
	if err != nil {
		return c.JSON(http.StatusBadRequest, errMsg("Invalid request"))
	}

	user, err := sessionUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errMsg("Error retrieving user info"))
	}

	if form.Content == "" || form.Name == "" || form.CategoryID == nil {
		return c.JSON(http.StatusBadRequest, errMsg("Missing required fields"))
	}

	categoryName, err := getCategoryNameByID(*form.CategoryID)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusBadRequest, errMsg("Category submitted doesn't exist"))
	}

	existingPage, err := selectPageByNameAndCategory(form.Name, categoryName)
	if err != nil && !errors.Is(sql.ErrNoRows, err) {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, errMsg("Error retrieving existing page"))
	}

	var page *Page
	if form.ID != nil {
		page, err = selectPageByID(*form.ID)
		if err != nil {
			fmt.Println(err)
			return c.JSON(http.StatusBadRequest, errMsg("Unable to retrieve page for ID"))
		}

		if existingPage != nil && existingPage.ID != page.ID {
			return c.JSON(http.StatusBadRequest, errMsg("Page already exists with this name under the new category"))
		}

		page, err = updatePage(page.ID, *form.CategoryID, form.Name, form.Content, user)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, errMsg("Unable to update wiki page"))
		}

	} else {
		if existingPage != nil {
			return c.JSON(http.StatusBadRequest, errMsg("Page with this name already exists under this category"))
		}

		page, err = createPage(form.Name, form.Content, *form.CategoryID, user)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, errMsg("Error creating wiki page"))
		}
	}

	jsonMsg, _ := json.MarshalIndent(resMsg("Updated page successfully", page), "", "\t")
	fmt.Println(string(jsonMsg))
	return c.JSON(http.StatusOK, resMsg("Updated page successfully", page))
}

func getPageVersions(c echo.Context) error {
	pageName := strings.Trim(c.Param("Page"), " ")
	categoryName := strings.Trim(c.Param("Category"), " ")
	if pageName == "" || (pageName != "" && categoryName == "") {
		return c.JSON(http.StatusBadRequest, errMsg("Invalid request"))
	}

	var page *Page
	if categoryName == "" {
		pages, err := getPagesByName(pageName)
		if err != nil || len(pages) != 1 {
			return c.JSON(http.StatusBadRequest, errMsg("Error retrieving page"))
		}

		page = &pages[0]
	} else {
		var err error
		page, err = selectPageByNameAndCategory(pageName, categoryName)
		if err != nil {
			return c.JSON(http.StatusBadRequest, errMsg("No page found"))
		}
	}

	edits, err := selectPageEdits(page.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errMsg("Error retrieving page edits"))
	}

	return c.JSON(http.StatusOK, edits)
}

func getPageContentByVersion(c echo.Context) error {
	pageName := strings.Trim(c.Param("Page"), " ")
	categoryName := strings.Trim(c.Param("Category"), " ")
	version, err := strconv.Atoi(strings.Trim(c.Param("Version"), " "))
	if err != nil || pageName == "" || categoryName == "" {
		return c.JSON(http.StatusBadRequest, errMsg("Invalid request"))
	}

	content, err := selectContentByVersion(pageName, categoryName, version)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusBadRequest, errMsg("No page found"))
	}

	return c.JSON(http.StatusOK, content)
}
