package webserver

import (
	"errors"
	"strings"
	"wiki-be/db"

	"github.com/microcosm-cc/bluemonday"
)

var bm *bluemonday.Policy = bluemonday.UGCPolicy()

func CreateDefaultUser() {
	hash, _ := hashPassword("defaultpassword")
	_, err := db.Exec(`
		INSERT OR IGNORE INTO Users (
			ID,
			Username,
			Password
		) VALUES (
			1,
			'Admin',
			?
		)`, hash)
	if err != nil {
		panic(err)
	}
}

func getUser(username string) (*User, error) {
	var user User
	err := db.Get(&user, `
		SELECT 
			ID,
			Username,
			Password
		FROM
			Users
		WHERE
			LOWER(Username) = LOWER(?)`, username)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func createUser(username string, password []byte) error {
	_, err := db.Exec(`
		INSERT INTO Users (
			ID,
			Username,
			Password
		) VALUES (
			NULL,
			?,
			?
		)`, username, password)

	return err
}

func getCategoryNameByID(id int) (string, error) {
	var name string
	err := db.Get(&name, `
		SELECT
			Name
		FROM
			Categories
		WHERE
			ID = ?`, id)
	if err != nil {
		return "", err
	}

	return name, nil
}

func getAllCategories() ([]Category, error) {
	var categories []Category
	err := db.Select(&categories, `
		SELECT
			ID,
			Name,
			SearchName
		FROM 
			Categories`)
	if err != nil {
		return nil, err
	}

	return categories, nil
}

func getCategory(name string) (*Category, error) {
	var category []Category
	err := db.Select(&category, `
		SELECT 
			ID,
			Name,
			SearchName
		FROM 
			Categories
		WHERE
			SearchName = ?`, cleanPageName(name))
	if err != nil {
		return nil, err
	}

	if len(category) > 0 {
		return &category[0], nil
	}

	return nil, nil
}

func insertCategory(name string) error {
	_, err := db.Exec(`
		INSERT INTO Categories (
			ID,
			Name,
			SearchName
		) VALUES (
			NULL,
			?,
			?
		)`, strings.Trim(name, " "), cleanPageName(name))

	return err
}

func getPagesByCategory(name string) ([]Page, error) {
	var pages []Page
	err := db.Select(&pages, `
		SELECT
			p.ID,
			p.CategoryID,
			c.Name AS CategoryName,
			p.Name,
			p.SearchName,
			c.SearchName AS CatSearchName
		FROM
			Pages p
		INNER JOIN
			Categories c
		ON
			p.CategoryID = c.ID
		WHERE
			c.Name = ?`, name)
	if err != nil {
		return nil, err
	}

	return pages, nil
}

func getPagesByName(name string) ([]Page, error) {
	var pages []Page
	err := db.Select(&pages, `
		SELECT
			p.ID,
			p.CategoryID,
			c.Name AS CategoryName,
			p.Name,
			p.SearchName,
			c.SearchName AS CatSearchName
		FROM
			Pages p
		INNER JOIN
			Categories c
		ON
			p.CategoryID = c.ID
		WHERE
			LOWER(p.SearchName) = LOWER(?)`, name)
	if err != nil {
		return nil, err
	}

	return pages, nil
}

func getPageContentByID(id int) (*PageContent, error) {
	var page PageContent
	err := db.Get(&page, `
		SELECT
			pc.PageID,
			p.Name,
			p.CategoryID,
			p.SearchName,
			pc.Version,
			pc.Content,
			pc.EditedBy,
			u.Username,
			pc.DateModified,
			c.SearchName AS CatSearchName
		FROM
			PageContent pc
		INNER JOIN
			Pages p
		ON 
			p.ID = pc.PageID
		INNER JOIN
			Categories c
		ON
			p.CategoryID = c.ID
		LEFT JOIN
			Users u
		ON
			pc.EditedBy = u.ID
		WHERE
			pc.PageID = ?
		ORDER BY
			pc.Version DESC
		LIMIT 1`, id)
	if err != nil {
		return nil, err
	}

	return &page, nil
}

func createPage(name, content string, categoryID int, user *User) (*Page, error) {
	var id int
	err := db.Get(&id, `
		INSERT INTO Pages (
			ID,
			CategoryID,
			Name,
			SearchName
		) VALUES (
			NULL,
			?,
			?,
			?
		) RETURNING ID`, categoryID, strings.Trim(name, " "), cleanPageName(name))
	if err != nil {
		return nil, err
	}

	_, err = db.Exec(`
		INSERT INTO PageContent (
			PageID,
			Version,
			Content,
			EditedBy,
			DateModified
		) VALUES (
			?,
			1,
			?,
			?,
			DATE()
		)`, id, bm.Sanitize(content), user.ID)
	if err != nil {
		return nil, err
	}

	page, _ := selectPageByID(id)

	return page, nil
}

func selectPageByNameAndCategory(pageName, category string) (*Page, error) {
	var page Page
	err := db.Get(&page, `
		SELECT
			p.ID,
			p.Name,
			c.ID AS CategoryID,
			c.Name AS CategoryName,
			p.SearchName,
			c.SearchName AS CatSearchName
		FROM
			Pages p
		INNER JOIN
			Categories c
		ON
			p.CategoryID = c.ID
		WHERE
			LOWER(p.SearchName) = LOWER(?)
		AND
			LOWER(c.SearchName) = LOWER(?)`, cleanPageName(pageName), cleanPageName(category))
	if err != nil {
		return nil, err
	}

	return &page, nil
}

func updatePage(id, categoryID int, name, content string, user *User) (*Page, error) {
	res, err := db.Exec(`
		UPDATE 
			Pages 
		SET 
			Name = ?,
			CategoryID = ?,
			SearchName = ?
		WHERE 
			ID = ?`, name, categoryID, cleanPageName(name), id)
	if err != nil {
		return nil, err
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return nil, errors.New("No page found with ID")
	}

	res, err = db.Exec(`
		INSERT INTO PageContent (
			PageID,
			Version,
			Content,
			EditedBy,
			DateModified
		) VALUES (
			?,
			(SELECT MAX(Version) + 1 FROM PageContent WHERE PageID = ? GROUP BY PageID),
			?,
			?,
			DATE()
		)`, id, id, bm.Sanitize(content), user.ID)
	if err != nil {
		return nil, err
	}

	page, _ := selectPageByID(id)

	return page, nil
}

func selectPageByID(id int) (*Page, error) {
	var page Page
	err := db.Get(&page, `
		SELECT
			p.ID,
			p.Name,
			c.ID AS CategoryID,
			c.Name AS CategoryName,
			p.SearchName,
			c.SearchName AS CatSearchName
		FROM
			Pages p
		INNER JOIN
			Categories c
		ON
			p.CategoryID = c.ID
		WHERE
			p.ID = ?`, id)
	if err != nil {
		return nil, err
	}

	return &page, nil
}

func selectPageEdits(id int) ([]PageContent, error) {
	var edits []PageContent
	err := db.Select(&edits, `
		SELECT
			pc.PageID,
			p.Name,
			p.SearchName,
			p.CategoryID,
			pc.Version,
			pc.EditedBy,
			u.Username,
			pc.DateModified,
			c.SearchName AS CatSearchName
		FROM
			PageContent pc
		INNER JOIN
			Pages p
		ON 
			pc.PageID = p.ID
		INNER JOIN
			Categories c
		ON
			p.CategoryID = c.ID
		LEFT JOIN
			Users u
		ON
			pc.EditedBy = u.ID
		WHERE
			pc.PageID = ?`, id)
	if err != nil {
		return nil, err
	}

	return edits, nil
}

func selectContentByVersion(pageName, categoryName string, version int) (*PageContent, error) {
	var content PageContent
	err := db.Get(&content, `
		SELECT
			pc.PageID,
			p.Name,
			p.SearchName,
			p.CategoryID,
			pc.Version,
			pc.EditedBy,
			u.Username,
			pc.Content,
			c.SearchName AS CatSearchName
		FROM
			PageContent pc
		INNER JOIN
			Pages p
		ON 
			pc.PageID = p.ID
		INNER JOIN
			Categories c
		ON
			p.CategoryID = c.ID
		LEFT JOIN
			Users u
		ON 
			pc.EditedBy = u.ID
		WHERE
			p.SearchName = ?
		AND
			c.SearchName = ?
		AND
			pc.Version = ?`, cleanPageName(pageName), cleanPageName(categoryName), version)
	if err != nil {
		return nil, err
	}

	return &content, nil
}
