package main

import (
	"Docker-odd/functions"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"result": "Welcome to the homepage!",
		})
	})

	r.POST("/api", func(c *gin.Context) {
		startTime := time.Now()

		// recieve a request
		var req Request
		if err := c.ShouldBindJSON(&req); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"status":     "Failure",
				"result":     "Invalid input format. Ensure input is a valid JSON.",
				"time_taken": "0",
				"start_time": fmt.Sprintf("%d", startTime.Unix()),
			})
			return
		}

		// Parse the JSON data into the Event
		var event functions.EvenOddEvent
		if err := json.Unmarshal([]byte(req.Root), &event); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"status":     "Failure",
				"result":     "Some error occurred while parsing input. Ensure that input is a valid JSON in correct format. Contact admin for more details.",
				"time_taken": "0",
				"start_time": fmt.Sprintf("%d", startTime.Unix()),
			})
			return
		}

		// handel the event
		message, err := functions.LambdaHandler(event)

		elapsed := time.Since(startTime)
		elapsedTime := float64(elapsed.Nanoseconds()) / 1e9 // Convert nanoseconds to seconds

		//return the result
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":     "Failure",
				"result":     err.Error(),
				"time_taken": fmt.Sprintf("%.9f", elapsedTime),
				"start_time": fmt.Sprintf("%d", startTime.Unix()),
			})
		} else {
			c.JSON(http.StatusOK, gin.H{
				"status":     "Success",
				"result":     message,
				"nextInput":  event,
				"time_taken": fmt.Sprintf("%.9f", elapsedTime),
				"start_time": fmt.Sprintf("%d", startTime.Unix()),
			})
		}
	})

	r.POST("/api/shutdown", func(c *gin.Context) {
		shutdownServer(c)
	})

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"result": "success",
		})
	})

	if err := r.Run("0.0.0.0:5000"); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}

func shutdownServer(c *gin.Context) {
	// Assume there's a condition to stop the server, such as receiving a signal or a scheduled task
	// Here's a simple example of stopping after a delay
	time.Sleep(5 * time.Second) // Assume waiting for 5 seconds before stopping the server

	// Create a context with a timeout of 5 seconds
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Call the server's Shutdown method to gracefully shutdown the server
	if err := c.Request.Context().Done(); err != nil {
		log.Fatalf("Shutdown error: %v", err)
	}

	r := gin.Default() // Declare the variable 'r' as a gin engine
	server := &http.Server{Addr: ":5000", Handler: r}
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"result": fmt.Sprintf("Server shutdown error: %v", err),
		})
	}
	log.Println("Server stopped gracefully")
	c.JSON(http.StatusOK, gin.H{
		"result": "Server stopped gracefully",
	})
}

type Request struct {
	Root string `json:"root"`
}
