package db

import (
	"database/sql"
	"os"

	_ "github.com/glebarez/go-sqlite"
	"github.com/jmoiron/sqlx"
)

var (
	dbConn *sqlx.DB
)

func InitDB() {
	var err error
	dbConn, err = sqlx.Open("sqlite", "wiki.db")
	if err != nil {
		panic(err)
	}

	file, err := os.ReadFile("schema.sql")
	if err != nil {
		panic(err)
	}

	dbConn.MustExec(string(file))

	insertDefaults()
}

func insertDefaults() {
	dbConn.MustExec(`
		INSERT OR IGNORE INTO Categories (
			ID,
			Name,
			SearchName
		) VALUES (
			1,
			'General',
			'General'
		)`)

	dbConn.MustExec(`
		INSERT OR IGNORE INTO Pages (
			ID,
			CategoryID,
			Name,
			SearchName
		) VALUES (
			1,
			1,
			'Welcome Page',
			'Welcome Page'
		)`)

	dbConn.MustExec(`
		INSERT OR IGNORE INTO PageContent (
			PageID,
			Version,
			Content,
			EditedBy,
			DateModified			
		) VALUES (
			1,
			1,
			'<h1>Welcome</h1><p>Welcome to the wiki</p>',
			1,
			DATE()
		)`)
}

func Exec(query string, args ...any) (sql.Result, error) {
	return dbConn.Exec(query, args...)
}

func Get(dest interface{}, query string, args ...interface{}) error {
	return dbConn.Get(dest, query, args...)
}

func Select(dest interface{}, query string, args ...interface{}) error {
	return dbConn.Select(dest, query, args...)
}
