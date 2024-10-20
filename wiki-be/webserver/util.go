package webserver

import (
	"fmt"
	"regexp"
	"strings"
)

func strPtr(str string) *string {
	return &str
}

func errMsg(message string, params ...interface{}) ResponseMsg {
	return ResponseMsg{
		Error: strPtr(fmt.Sprintf(message, params...)),
	}
}

func resMsg(message string, page *Page, params ...interface{}) ResponseMsg {
	return ResponseMsg{
		Result: strPtr(fmt.Sprintf(message, params...)),
		Page:   page,
	}
}

func cleanPageName(name string) string {
	rgx := regexp.MustCompile(`[&$+,/:;=?@#<>\[\]^%]`)
	return strings.Trim(rgx.ReplaceAllString(name, ""), " ")
}
