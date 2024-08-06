FROM golang:1.18.1

WORKDIR /Docker_gin_even

COPY . .

RUN go mod tidy

EXPOSE 5000

CMD [ "go", "run" , "app.go"]
