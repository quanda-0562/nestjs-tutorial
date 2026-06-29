# Articles Feature

This module implements article management functionality following the RealWorld API specification.

## Overview

The Articles module provides complete CRUD operations for managing articles with features including:
- Create, read, update, and delete articles
- Article favoriting system
- Slug-based URL-friendly article identification
- Author information with articles
- Tag support for article categorization

## Entity Structure

### Article Entity

The `Article` entity stores article data with the following fields:

```typescript
{
  id: number;                    // Primary key (auto-generated)
  slug: string;                  // URL-friendly unique identifier
  title: string;                 // Article title
  description: string;           // Article description/summary
  body: string;                  // Full article content
  tagList: string[];             // Array of tags
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
  favoritesCount: number;        // Number of users who favorited
  author: User;                  // Article author (many-to-one relationship)
  favoritedBy: User[];           // Users who favorited (many-to-many)
}
```

## API Response Format

### Single Article Response

```json
{
  "article": {
    "slug": "how-to-train-your-dragon",
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "It takes a Jacobian",
    "tagList": ["dragons", "training"],
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }
}
```

### Multiple Articles Response

```json
{
  "articles": [
    { /* article object */ },
    { /* article object */ }
  ],
  "articlesCount": 2
}
```

## API Endpoints

### Create Article
- **POST** `/api/articles`
- **Auth**: Required (Bearer token)
- **Request Body**: 
```json
{
  "article": {
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "You have to believe",
    "tagList": ["reactjs", "angularjs", "dragons"]
  }
}
```
- **Required Fields**: `title`, `description`, `body`
- **Optional Fields**: `tagList` (array of strings)
- **Response**: `SingleArticleResponseDto`

### Get All Articles
- **GET** `/api/articles`
- **Auth**: Optional
- **Query Parameters**:
  - `tag` (string, optional): Filter articles by tag. Example: `?tag=AngularJS`
  - `author` (string, optional): Filter articles by author username. Example: `?author=jake`
  - `favorited` (string, optional): Filter articles favorited by a specific user (username). Example: `?favorited=jake`
  - `limit` (number, optional, default: 20): Maximum number of articles to return. Example: `?limit=20`
  - `offset` (number, optional, default: 0): Number of articles to skip. Example: `?offset=0`
- **Query Examples**:
  - Get all articles: `GET /api/articles`
  - Filter by tag: `GET /api/articles?tag=AngularJS`
  - Filter by author: `GET /api/articles?author=jake`
  - Filter by favorited: `GET /api/articles?favorited=jake`
  - Pagination: `GET /api/articles?limit=20&offset=40`
  - Combined filters: `GET /api/articles?author=jake&tag=AngularJS&limit=10&offset=0`
- **Response**: `MultipleArticlesResponseDto` (returns `articlesCount` with total matching articles, not just returned count)
- **Ordering**: Articles ordered by creation date, most recent first

### Get Article
- **GET** `/api/articles/:slug`
- **Auth**: Not required
- **Response**: `SingleArticleResponseDto`

### Update Article
- **PUT** `/api/articles/:slug`
- **Auth**: Required (Bearer token)
- **Request Body**:
```json
{
  "article": {
    "title": "Did you train your dragon?"
  }
}
```
- **Optional Fields**: `title`, `description`, `body`
- **Response**: `SingleArticleResponseDto`
- **Note**: Only article author can update. The slug gets updated automatically when the title is changed
- **Authorization**: Only the author of the article can update it

### Delete Article
- **DELETE** `/api/articles/:slug`
- **Auth**: Required (Bearer token)
- **Response**: 204 No Content
- **Authorization**: Only the author of the article can delete it

### Favorite Article
- **POST** `/api/articles/:slug/favorite`
- **Auth**: Required (Bearer token)
- **Response**: `SingleArticleResponseDto`

### Unfavorite Article
- **DELETE** `/api/articles/:slug/favorite`
- **Auth**: Required (Bearer token)
- **Response**: `SingleArticleResponseDto`

## Request DTOs

### CreateArticleDto

```typescript
{
  title: string;           // Required, max 255 chars
  description: string;     // Required, max 500 chars
  body: string;           // Required
  tagList?: string[];     // Optional
}
```

### UpdateArticleDto

```typescript
{
  title?: string;         // Optional
  description?: string;   // Optional
  body?: string;         // Optional
  tagList?: string[];    // Optional
}
```

## Key Features

### Slug Generation
- Automatically generated from article title
- URL-safe, lowercase, hyphen-separated
- Unique constraint ensures no duplicates

### Authorization
- Create/Update/Delete operations require authentication
- Users can only update/delete their own articles
- Favorite operations require authentication

### Relationships
- Each article has one author (User)
- Users can favorite multiple articles
- Articles can be favorited by multiple users

## Database Schema

### articles table
```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  body TEXT NOT NULL,
  tagList simple-array,
  favoritesCount INTEGER DEFAULT 0,
  authorId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### article_favorites table (junction table)
```sql
CREATE TABLE article_favorites (
  articleId INTEGER PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  userId INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);
```

## Running Migrations

To create the article tables in your database:

```bash
npm run migration:run
```

To revert the migration:

```bash
npm run migration:revert
```

## Usage Examples

### Create an Article
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "It takes a Jacobian",
    "tagList": ["dragons", "training"]
  }'
```

### Get All Articles
```bash
curl http://localhost:3000/api/articles
```

### Get Article by Slug
```bash
curl http://localhost:3000/api/articles/how-to-train-your-dragon
```

### Update Article
```bash
curl -X PUT http://localhost:3000/api/articles/how-to-train-your-dragon \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title"
  }'
```

### Favorite Article
```bash
curl -X POST http://localhost:3000/api/articles/how-to-train-your-dragon/favorite \
  -H "Authorization: Bearer <token>"
```

## Future Enhancements

- Pagination support for article listings
- Filtering by tag, author, or favorited status
- Comment system on articles
- Article follow/unfollow functionality
- Search functionality
- Article view count tracking
