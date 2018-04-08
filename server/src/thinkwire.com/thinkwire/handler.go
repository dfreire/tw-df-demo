package thinkwire

import (
	"errors"
	"net/http"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo"
	uuid "github.com/satori/go.uuid"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db}
}

func (h *Handler) Signup(c echo.Context) error {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	c.Bind(&request)

	if request.Email == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": errors.New("Missing parameter 'email'")})
	}

	if request.Password == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": errors.New("Missing parameter 'password'")})
	}

	user := &User{
		Email: request.Email,
	}

	res := h.db.Where(user).First(user)
	if res.Error != nil && res.Error.Error() != "record not found" {
		return c.JSON(http.StatusConflict, echo.Map{"message": res.Error})
	}

	if user.ID != 0 {
		return c.JSON(http.StatusConflict, echo.Map{"message": errors.New("This email address is already being used")})
	}

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error})
	}

	confirmationKey := uuid.NewV4().String()

	user = &User{
		Email:           request.Email,
		HashedPass:      hashedPass,
		ConfirmationKey: confirmationKey,
	}

	h.db.Create(user)

	return c.JSON(http.StatusOK, echo.Map{"ck": confirmationKey})
}

func (h *Handler) Confirm(c echo.Context) error {
	var request struct {
		ConfirmationKey string `json:"ck"`
	}
	c.Bind(&request)

	if request.ConfirmationKey == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": errors.New("Missing parameter 'ck'")})
	}

	user := &User{
		ConfirmationKey: request.ConfirmationKey,
	}

	res := h.db.Where(user).First(user)
	if res.Error != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"message": res.Error})
	}

	user.IsConfirmed = true
	h.db.Save(user)

	return c.JSON(http.StatusOK, echo.Map{})
}

func (h *Handler) Signin(c echo.Context) error {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	c.Bind(&request)

	if request.Email == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": errors.New("Missing parameter 'email'")})
	}

	if request.Password == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": errors.New("Missing parameter 'password'")})
	}

	user := &User{
		Email: request.Email,
	}

	res := h.db.Where(user).First(user)
	if res.Error != nil {
		return c.JSON(http.StatusNotFound, res.Error)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.HashedPass), []byte(request.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, "The password didn't match.")
	}

	if !user.IsConfirmed {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": errors.New("The user has not confirmed the account")})
	}

	sessionKey := uuid.NewV4().String()

	user.SessionKey = sessionKey
	h.db.Save(user)

	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["sessionKey"] = sessionKey
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	jwtSecret := []byte(viper.GetString("JWT_SECRET"))
	st, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error})
	}

	return c.JSON(http.StatusOK, echo.Map{"st": st})
}

func (h *Handler) Signout(c echo.Context) error {
	claims := c.Get("user").(*jwt.Token).Claims.(jwt.MapClaims)
	sessionKey := claims["sessionKey"].(string)

	user := &User{
		SessionKey: sessionKey,
	}

	res := h.db.Where(user).First(user)
	if res.Error != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"message": res.Error})
	}

	user.IsConfirmed = true
	user.SessionKey = ""
	h.db.Save(user)

	return c.JSON(http.StatusOK, echo.Map{})
}

func (h *Handler) ChangePassword(c echo.Context) error {
	claims := c.Get("user").(*jwt.Token).Claims.(jwt.MapClaims)
	sessionKey := claims["sessionKey"].(string)

	var request struct {
		Password string `json:"password"`
	}
	c.Bind(&request)

	if request.Password == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": errors.New("Missing parameter 'password'")})
	}

	user := &User{
		SessionKey: sessionKey,
	}

	res := h.db.Where(user).First(user)
	if res.Error != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"message": res.Error})
	}

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error})
	}

	user.HashedPass = hashedPass
	h.db.Save(user)

	return c.JSON(http.StatusOK, echo.Map{})
}
