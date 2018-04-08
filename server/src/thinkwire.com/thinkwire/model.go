package thinkwire

import (
	"github.com/jinzhu/gorm"
)

type User struct {
	gorm.Model
	Email           string `gorm:"type:varchar(100);unique_index"`
	HashedPass      []byte
	IsConfirmed     bool
	ConfirmationKey string
	SessionKey      string
}
