# Wiki Demo Project

Your job is to create a super basic wiki using javascript or typescript.



### Getting started
Install nvm, unless you have node v22 installed already
```
nvm install 22
nvm use 22
```

Clone the repo and run 
```
npm i
npm run serve
```

Start the backend
```
cd wiki-be
go run .
```

### Notes
* Register an account or use the account "Admin" with the password "defaultpassword"
* Basic authentication is set up via JWT, it will only check that the JWT is valid and doesn't have any changing values. It will store the JWT token in a cookie and use it as a "Authorization: Bearer <token>" header
* Pages can be accessed via /wiki/:pageName or /wiki/:pageName/:categoryName, if a conflict is hit on /wiki/:pageName it will show links to the different pages in each category that match
* Route page/category named are stripped of special characters and will count as a duplicate if the stripped names match
* Pages can duplicate names between categories but will be prevented from moving the page to another category that has a conflicting page name
* Page history is available and you can view the different versions of the page, this will only reflect changes in content and not categories
* Categories can be created and will be stripped of special characters and checked for duplicate names
* Page editor supports markdown, when the edit button is pressed on an existing page it will load the content in so it can be further edited
* HTML is sanitized on the back end to prevent unwanted HTML injection
