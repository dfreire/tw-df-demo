package main

import (
	"log"
	"strings"

	"thinkwire.com/thinkwire"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/spf13/viper"
)

func main() {
	viper.SetEnvPrefix("TW")
	viper.AutomaticEnv()

	db, err := gorm.Open("postgres", viper.Get("DB_CONNECTION"))
	defer db.Close()

	if err != nil {
		log.Fatal(err)
	}

	db.SingularTable(true)
	db.AutoMigrate(&thinkwire.User{})

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	h := thinkwire.NewHandler(db)

	apiGroup := e.Group("/api")
	apiGroup.POST("/signup", h.Signup)
	apiGroup.POST("/confirm", h.Confirm)
	apiGroup.POST("/signin", h.Signin)

	jwtSecret := []byte(viper.GetString("JWT_SECRET"))
	sessionGroup := apiGroup.Group("/session")
	sessionGroup.Use(middleware.JWTWithConfig(middleware.JWTConfig{Claims: jwt.MapClaims{}, SigningKey: jwtSecret}))
	sessionGroup.POST("/signout", h.Signout)
	sessionGroup.POST("/changepass", h.ChangePassword)

	e.Logger.Fatal(e.Start(strings.Join([]string{"", viper.GetString("PORT")}, ":")))
}
