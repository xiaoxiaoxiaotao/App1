package functions

import (
	"fmt"
	"strconv"
)

type NumEvent struct {
	Number string `json:"number"`
}

type EvenOddEvent struct {
	Number int `json:"number"`
}

func LambdaHandler(event NumEvent) (int, error) {
	fmt.Println(event)
	number, err := strconv.Atoi(event.Number)
	if err != nil {
		return 0, err
	}
	return number, nil
}
