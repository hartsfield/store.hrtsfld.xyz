package main

import (
	"context"
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

// post is a post in a stream of posts
type post struct {
	Product     string   `redis:"Product" json:"product"`
	Price       string   `redis:"Price" json:"price"`
	Description string   `redis:"Description" json:"description"`
	Listed      string   `redis:"Listed" json:"listed"`
	Stocked     string   `redis:"Stocked" json:"stocked"`
	Image       string   `redis:"Image" json:"image"`
	ID          string   `redis:"ID" json:"ID"`
	TS          string   `redis:"TS" json:"timestamp"`
	Tags        []string `redis:"Tags" json:"tags"`
	Testing     string   `redis:"Testing" json:"testing"`
}

// pageData is used in the HTML templates as the main page model. It is
// composed of credentials, postData, and threadData.
type pageData struct {
	Company  string       `json:"company"`
	UserData *credentials `json:"userData"`
	// StreamTitle string       `json:"streamTitle"`
	Stream   []*post `json:"tracks"`
	Number   int64   `json:"number"`
	PageName string  `json:"pageName"`
	Category string  `json:"category"`
}

// ckey/ctxkey is used as the key for the HTML context and is how we retrieve
// token information and pass it around to handlers
type ckey int

const (
	ctxkey ckey = iota
)

var (
	// hmacss=hmac_sample_secret
	// testPass=testingPassword

	// hmacSampleSecret is used for creating the token
	hmacSampleSecret = []byte(os.Getenv("hmacss"))

	// connect to redis
	redisIP = os.Getenv("redisIP")
	rdb     = redis.NewClient(&redis.Options{
		Addr:     redisIP + ":6379",
		Password: "",
		DB:       0,
	})

	// HTML templates. We use them like components and compile them
	// together at runtime.
	templates = template.Must(template.New("main").ParseGlob("internal/*/*"))
	// this context is used for the client/server connection. It's useful
	// for passing the token/credentials around.
	rdbctx = context.Background()
)

func main() {
	// for generating IDs
	rand.Seed(time.Now().UTC().UnixNano())

	// Tells 'log' to log the line number
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// multiplexer
	mux := http.NewServeMux()
	mux.Handle("/", checkAuth(http.HandlerFunc(getStream)))
	// mux.Handle("/CONTÂCT", checkAuth(http.HandlerFunc(contactView)))
	mux.Handle("/checkout", checkAuth(http.HandlerFunc(checkoutView)))
	// mux.Handle("/success", checkAuth(http.HandlerFunc(latestView)))
	mux.Handle("/create-payment-intent", checkAuth(http.HandlerFunc(handleCreatePaymentIntent)))
	// mux.Handle("/create-checkout-session", checkAuth(http.HandlerFunc(createCheckoutSession)))
	mux.Handle("/api/nextPage", checkAuth(http.HandlerFunc(nextPage)))
	mux.Handle("/api/like", checkAuth(http.HandlerFunc(likePost)))
	mux.Handle("/api/getStream", checkAuth(http.HandlerFunc(getStream)))
	mux.Handle("/api/newPost", checkAuth(http.HandlerFunc(newPost)))
	mux.HandleFunc("/api/signup", signup)
	mux.HandleFunc("/api/signin", signin)
	mux.HandleFunc("/api/logout", logout)
	mux.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("public"))))

	// Server configuration
	srv := &http.Server{
		// in production only use SSL
		Addr:              ":8667",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       5 * time.Second,
	}

	ctx, cancelCtx := context.WithCancel(context.Background())

	// This can be used as a template for running concurrent servers
	// https://www.digitalocean.com/community/tutorials/how-to-make-an-http-server-in-go
	go func() {
		err := srv.ListenAndServe()
		if err != nil {
			fmt.Println(err)
		}
		cancelCtx()
	}()

	fmt.Println("Server started @ " + srv.Addr)

	// without this the program would not stay running
	<-ctx.Done()
}
