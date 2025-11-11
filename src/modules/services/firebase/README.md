# Firebase Service Documentation

The `FirebaseService` is a NestJS injectable service that provides **full backend access to Firebase features**. It wraps **Authentication, Firestore, Messaging (FCM), and Storage**, exposing a clean, consistent API with proper error handling.

## Features

* **Authentication (Auth)**

  * Create, update, delete users
  * Retrieve users by UID
  * Generate custom authentication tokens
* **Firestore**

  * CRUD operations on documents
  * Collection references
* **Messaging (FCM)**

  * Send single or batch messages
  * Multicast messages
  * Topic subscription management
* **Storage**

  * Upload, download, delete files
  * Public URLs for uploaded files

---

## Installation

```bash
npm install firebase-admin @nestjs/common
```

---

Ah, good catch! Here's the **updated README section** including the module registration:

---

## Module Registration

To use the `FirebaseService` in your NestJS project, import the `FirebaseModule` into your feature module:

```ts
import { Module } from '@nestjs/common'
import { FirebaseModule } from './services/firebase/firebase.module'
import { MyService } from './my.service'

@Module({
  imports: [FirebaseModule],
  providers: [MyService]
})
export class MyModule {}
```

Once imported, you can inject `FirebaseService` anywhere in the module:

---

## Initialization

The service initializes a Firebase App using the **default credentials**, typically from environment variables:

```ts
import { FirebaseService } from './firebase.service'

@Injectable()
export class MyService {
  constructor(private readonly firebase: FirebaseService) {}
}
```

> Ensure your Firebase credentials (JSON key file) are set via `GOOGLE_APPLICATION_CREDENTIALS` or environment variables.

---

## Authentication Usage

```ts
// Create a new user
const user = await firebaseService.createUser({
  email: 'john.doe@example.com',
  password: 'securePassword123'
})

// Get user info
const userInfo = await firebaseService.getUser(user.uid)

// Update user
await firebaseService.updateUser(user.uid, { displayName: 'John Doe' })

// Delete user
await firebaseService.deleteUser(user.uid)

// Generate a custom token
const token = await firebaseService.generateCustomToken(user.uid, { role: 'admin' })
```

---

## Firestore Usage

```ts
// Set or overwrite a document
await firebaseService.setDocument('users/userId', { name: 'John', role: 'admin' })

// Update a document
await firebaseService.updateDocument('users/userId', { role: 'moderator' })

// Get a document
const doc = await firebaseService.getDocument('users/userId')
console.log(doc.data())

// Delete a document
await firebaseService.deleteDocument('users/userId')

// Access collection reference
const usersCollection = firebaseService.getCollection('users')
```

---

## Messaging (FCM) Usage

```ts
// Send a single message
await firebaseService.sendMessage({
  token: 'userDeviceToken',
  notification: {
    title: 'Hello',
    body: 'You have a new notification'
  }
})

// Send multiple messages in batch
await firebaseService.sendMessages([message1, message2])

// Multicast messages
await firebaseService.sendMulticast({
  tokens: ['token1', 'token2'],
  notification: { title: 'Hi', body: 'Multicast message' }
})

// Subscribe tokens to a topic
await firebaseService.subscribeToTopic(['token1', 'token2'], 'news')

// Unsubscribe tokens from a topic
await firebaseService.unsubscribeFromTopic(['token1', 'token2'], 'news')
```

---

## Storage Usage

```ts
// Upload a file
const url = await firebaseService.uploadFile('uploads/image.png', buffer, { contentType: 'image/png' })

// Download a file
const data = await firebaseService.downloadFile('uploads/image.png')

// Delete a file
await firebaseService.deleteFile('uploads/image.png')
```

---

## Notes

* All methods throw **NestJS HttpExceptions** on failure with appropriate status codes.
* The service is fully **injectable** and can be easily mocked for testing.
* Supports **all Firebase services required for typical backend projects**.
* Can be expanded to support multiple Firebase App instances if needed.
