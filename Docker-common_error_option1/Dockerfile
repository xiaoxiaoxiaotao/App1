FROM golang:1.18.1

WORKDIR /Docker_gin_common_error_option1

COPY . .

RUN go mod tidy

EXPOSE 5000

CMD [ "go", "run" , "app.go"]
