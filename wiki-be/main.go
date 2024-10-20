package main

import (
	"wiki-be/db"
	"wiki-be/webserver"
)

func main() {
	db.InitDB()
	webserver.CreateDefaultUser()
	webserver.StartServer()

}
