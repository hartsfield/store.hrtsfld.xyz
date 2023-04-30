package main

import (
	"context"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/hartsfield/ohsheet"
)

var (
	// connect to redis
	redisIP = os.Getenv("redisIP")
	rdb     = redis.NewClient(&redis.Options{
		Addr:     redisIP + ":6379",
		Password: "",
		DB:       0,
	})

	rdx = context.Background()
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

func main() {
	rand.Seed(time.Now().UTC().UnixNano())
	// pipe := rdb.Pipeline()
	for _, row := range getDataFromSheets() {
		log.Println(row)
		post, ID := makePost(row)

		_, err := rdb.HMSet(rdx, ID, post).Result()
		if err != nil {
			log.Println(err)
		}

		_, err = rdb.ZAdd(rdx, "STREAM:STORE:CHRON", makeZmem(ID)).Result()
		if err != nil {
			log.Println(err)
		}
	}
	// _, err := pipe.Exec(rdx)
	// if err != nil {
	// 	log.Println(err)
	// }

}

// makeZmem returns a redis Z member for use in a ZSET. Score is set to zero
func makeZmem(st string) *redis.Z {
	return &redis.Z{
		Member: st,
		Score:  float64(time.Now().UnixNano()),
	}
}

func makePost(row []interface{}) (post map[string]interface{}, ID string) {
	ID = genPostID(9)
	return map[string]interface{}{
		"Product":     row[0].(string),
		"Price":       row[1].(string),
		"Description": row[2].(string),
		"Image":       row[4].(string),
		"Stocked":     row[6].(string),
		"ID":          ID,
	}, ID
}

// genPostID generates a post ID
func genPostID(length int) (ID string) {
	symbols := "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	for i := 0; i <= length; i++ {
		s := rand.Intn(len(symbols))
		ID += symbols[s : s+1]
	}
	return
}

func getDataFromSheets() [][]interface{} {
	// Connect to the API
	sheet := &ohsheet.Access{
		Token:       "token.json",
		Credentials: "credentials.json",
		Scopes:      []string{"https://www.googleapis.com/auth/spreadsheets"},
	}
	srv := sheet.Connect()

	spreadsheetId := "1LD8wcDGjROhas-r6G14kA8NvBFpUZNAvcvd4_MD4AjE"
	readRange := "A2:25"

	resp, err := sheet.Read(srv, spreadsheetId, readRange)
	if err != nil {
		log.Panicln("Unable to retrieve data from sheet: ", err)
	}

	return resp.Values
}
