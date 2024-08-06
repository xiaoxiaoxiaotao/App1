package functions

import (
	"errors"
)

type EvenOddEvent struct {
	Number int `json:"Number"`
}

func LambdaHandler(event EvenOddEvent) (string, error) {
	number := event.Number
	if number%2 == 0 {
		return "", errors.New("even number")
	} else {
		return "woohoo odd number", nil
	}
}
