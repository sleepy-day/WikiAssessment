package webserver

import (
	"encoding/json"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID       int    `db:"ID"`
	Username string `db:"Username"`
	Password []byte `db:"Password"`
	jwt.RegisteredClaims
}

type UserClaims struct {
	ID       int
	Username string
	jwt.RegisteredClaims
}

func (u *User) MarshalJSON() ([]byte, error) {
	type user User
	s := user(*u)
	s.Password = []byte{}
	return json.Marshal(s)
}

type UserAuth struct {
	Username string `json:"username" db:"Username"`
	Password string `json:"password" db:"Password"`
}

type ResponseMsg struct {
	Result *string `json:"result,omitempty" db:"Result"`
	Page   *Page   `json:"page,omitempty" db:"Page"`
	Error  *string `json:"error,omitempty" db:"Error"`
}

type Category struct {
	ID         int    `json:"id" db:"ID"`
	Name       string `json:"name" db:"Name"`
	SearchName string `json:"searchName" db:"SearchName"`
}

type Page struct {
	ID            int    `json:"id" db:"ID"`
	CategoryID    int    `json:"categoryID" db:"CategoryID"`
	CategoryName  string `json:"categoryName" db:"CategoryName"`
	Name          string `json:"name" db:"Name"`
	SearchName    string `json:"searchName" db:"SearchName"`
	CatSearchName string `json:"catSearchName" db:"CatSearchName"`
}

type PageContent struct {
	PageID        int       `json:"pageID" db:"PageID"`
	Name          string    `json:"name" db:"Name"`
	SearchName    string    `json:"searchName" db:"SearchName"`
	CategoryID    int       `json:"categoryID" db:"CategoryID"`
	CatSearchName string    `json:"catSearchName" db:"CatSearchName"`
	Version       int       `json:"version" db:"Version"`
	Content       string    `json:"content" db:"Content"`
	EditedBy      int       `json:"editedBy" db:"EditedBy"`
	Username      string    `json:"username" db:"Username"`
	DateModified  time.Time `json:"dateModified" db:"DateModified"`
}

type WikiPage struct {
	Content *PageContent `json:"content,omitempty" db:"Content"`
	Pages   []Page       `json:"pages,omitempty" db:"Pages"`
}

type PageForm struct {
	ID         *int   `json:"id" db:"ID"`
	Name       string `json:"name" db:"Name"`
	Content    string `json:"content" db:"Content"`
	CategoryID *int   `json:"categoryID" db:"CategoryID"`
}

type PageID struct {
	ID int `json:"id"`
}
