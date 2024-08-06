package functions

import (
	"errors"
)

func LambdaHandler(event EvenOddEvent) (string, error) {
	number := event.Number
	if number%2 == 0 {
		return "woohoo even number", nil
	} else {
		return "", errors.New("odd number")
	}
}

type EvenOddEvent struct {
	Number int `json:"number"`
}
