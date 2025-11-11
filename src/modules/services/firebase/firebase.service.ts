import * as firebase from "firebase-admin"
import { Auth } from "firebase-admin/lib/auth/auth"
import { HttpException, Injectable } from "@nestjs/common"
import { Messaging } from "firebase-admin/lib/messaging/messaging"
import { Message, MulticastMessage, BatchResponse, MessagingTopicManagementResponse } from "firebase-admin/lib/messaging/messaging-api"
import { Firestore, WriteResult, DocumentData, DocumentSnapshot, CollectionReference } from "firebase-admin/lib/firestore"

@Injectable()
export class FirebaseService {
  private readonly app: firebase.app.App

  constructor() {
    // Initialize Firebase App using default credentials or environment
    this.app = firebase.initializeApp()
  }

  // -------------------------------
  // AUTHENTICATION METHODS
  // -------------------------------

  getAuth(): Auth {
    return this.app.auth()
  }

  /**
   * Create a new user with email/password or custom properties
   */
  async createUser(data: { email: string; password?: string; displayName?: string; uid?: string }) {
    try {
      return await this.getAuth().createUser(data)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Get user by UID
   */
  async getUser(uid: string) {
    try {
      return await this.getAuth().getUser(uid)
    } catch (error) {
      throw new HttpException(error.message, 404)
    }
  }

  /**
   * Update user info
   */
  async updateUser(uid: string, data: Partial<{ email: string; displayName: string; password: string }>) {
    try {
      return await this.getAuth().updateUser(uid, data)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Delete user
   */
  async deleteUser(uid: string) {
    try {
      return await this.getAuth().deleteUser(uid)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Generate a custom token for client authentication
   */
  async generateCustomToken(uid: string, additionalClaims?: Record<string, any>) {
    try {
      return await this.getAuth().createCustomToken(uid, additionalClaims)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  // -------------------------------
  // FIRESTORE METHODS
  // -------------------------------

  private getFirestore(): Firestore {
    return this.app.firestore()
  }

  /**
   * Get a document by path
   */
  async getDocument(path: string): Promise<DocumentSnapshot<DocumentData>> {
    try {
      return await this.getFirestore().doc(path).get()
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Set a document (overwrite)
   */
  async setDocument(path: string, data: Record<string, any>): Promise<WriteResult> {
    try {
      return await this.getFirestore().doc(path).set(data)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(path: string, data: Partial<Record<string, any>>): Promise<WriteResult> {
    try {
      return await this.getFirestore().doc(path).update(data)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(path: string): Promise<WriteResult> {
    try {
      return await this.getFirestore().doc(path).delete()
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Get a collection reference
   */
  getCollection(path: string): CollectionReference<DocumentData> {
    return this.getFirestore().collection(path)
  }

  // -------------------------------
  // MESSAGING (FCM) METHODS
  // -------------------------------

  private getMessaging(): Messaging {
    return this.app.messaging()
  }

  /**
   * Send a single FCM message
   */
  async sendMessage(message: Message) {
    try {
      return await this.getMessaging().send(message)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Send multiple messages in a batch
   */
  async sendMessages(messages: Message[]): Promise<BatchResponse> {
    try {
      return await this.getMessaging().sendEach(messages)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Send a multicast message to multiple tokens
   */
  async sendMulticast(message: MulticastMessage) {
    try {
      return await this.getMessaging().sendEachForMulticast(message)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<MessagingTopicManagementResponse> {
    try {
      return await this.getMessaging().subscribeToTopic(tokens, topic)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<MessagingTopicManagementResponse> {
    try {
      return await this.getMessaging().unsubscribeFromTopic(tokens, topic)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  // -------------------------------
  // STORAGE METHODS
  // -------------------------------

  private getStorage() {
    return this.app.storage().bucket()
  }

  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(destination: string, buffer: Buffer, options?: { contentType?: string }) {
    try {
      const file = this.getStorage().file(destination)
      await file.save(buffer, { contentType: options?.contentType })
      return file.publicUrl()
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Download a file from Firebase Storage
   */
  async downloadFile(path: string): Promise<Buffer> {
    try {
      const file = this.getStorage().file(path)
      const [data] = await file.download()
      return data
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(path: string) {
    try {
      const file = this.getStorage().file(path)
      await file.delete()
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }
}
