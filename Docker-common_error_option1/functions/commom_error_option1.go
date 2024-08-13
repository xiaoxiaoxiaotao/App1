package functions

import (
	"fmt"
	"regexp"
)

func LambdaHandler(event map[string]string) string {
	fmt.Println(event)
	re := regexp.MustCompile(`Failure$`)
	var failedTask string

	for attr, value := range event {
		if re.MatchString(attr) {
			// Remove 'Failure' from the end of the attribute name
			failedTask = re.ReplaceAllString(attr, "")
			fmt.Printf("found the failed_task: %s\n", failedTask)
			fmt.Println(attr, value)
			// further error reporting or handling logic goes here
		}
	}
	return failedTask
}
