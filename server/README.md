# Twitter Tracker
## API
### POST /login
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