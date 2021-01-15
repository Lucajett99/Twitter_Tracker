# Twitter Tracker
A simple web application to collect tweets from Twitter, analyze and display them on word clouds or maps.
To run the app from a fresh repo clone, just run the commands `npm install` and `npm start` in sequence.
These commands will install all dependencies, build the project and start the server.

## API
### POST /auth/login
**Request**
Body:
```typescript
username: string
password: string
```
**Response**
Body:
```typescript
token: string
```

### PUT /tweet-collections/:name
**Request**
Params:
```typescript
name: string
```
Body:
```typescript
name: string
tweets: Tweet[]
```

### GET /tweet-collections/:name
**Request**
Params:
```typescript
name: string
```
**Response**
Body:
```typescript
name: string
tweets: Tweet[]
```

### DELETE /tweet-collections/:name
**Request**
Params:
```typescript
name: string
```