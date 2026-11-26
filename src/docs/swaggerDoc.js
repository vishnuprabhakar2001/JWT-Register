export const openApiSpec = {
  "openapi": "3.0.3",
  "info": {
    "title": "ReckomateAI Organisation Backend API",
    "version": "1.0.0",
    "description": "Complete interactive Swagger API documentation for Reckomate AI Organisation Admin, Subadmin, and Student Platform. 100% of all backend endpoints included.",
    "contact": {
      "name": "Reckomate AI Support",
      "email": "reckomateai@gmail.com"
    }
  },
  "servers": [
    {
      "url": "http://localhost:8002",
      "description": "Local Container (Port 8002)"
    }
  ],
  "components": {
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Enter your JWT Bearer token to authorize requests."
      }
    },
    "schemas": {
      "ApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Operation successful"
          },
          "data": {
            "type": "object",
            "nullable": true
          }
        }
      }
    }
  },
  "security": [
    {
      "BearerAuth": []
    }
  ],
  "paths": {
    "/api/organisation-admin/assigned-tests": {
      "post": {
        "tags": [
          "Assigned Tests (Admin)"
        ],
        "summary": "Assign Test Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "get": {
        "tags": [
          "Assigned Tests (Admin)"
        ],
        "summary": "Get All Assigned Tests Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/assigned-tests/{assigned_test_id}": {
      "delete": {
        "tags": [
          "Assigned Tests (Admin)"
        ],
        "summary": "Delete Assigned Test Api",
        "parameters": [
          {
            "name": "assigned_test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for assigned_test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/verify-otp": {
      "post": {
        "tags": [
          "Authentication (Student)"
        ],
        "summary": "Verify Otp",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/auth/refresh-token": {
      "post": {
        "tags": [
          "Authentication (Student)"
        ],
        "summary": "Refresh Token",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      "post": {
        "tags": [
          "Authentication (Student)"
        ],
        "summary": "Logout",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/auth/fcm-token": {
      "post": {
        "tags": [
          "Authentication (Student)"
        ],
        "summary": "Update Fcm Token",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/bulk-candidate-uploads": {
      "post": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "Create Bulk Candidate Upload",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "get": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "List Bulk Candidate Uploads",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/bulk-candidate-uploads/{upload_id}/download": {
      "get": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "Download Bulk Candidate Upload",
        "parameters": [
          {
            "name": "upload_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for upload_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/bulk-candidate-uploads/{upload_id}": {
      "get": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "Get Bulk Candidate Upload",
        "parameters": [
          {
            "name": "upload_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for upload_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "Update Bulk Candidate Upload",
        "parameters": [
          {
            "name": "upload_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for upload_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "Delete Bulk Candidate Upload",
        "parameters": [
          {
            "name": "upload_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for upload_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/bulk-candidate-uploads/bulk-delete": {
      "post": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "Bulk Delete Candidate Uploads",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/bulk-candidate-uploads/candidates/delete": {
      "post": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "Delete Bulk Candidates",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms": {
      "get": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "List Chat Rooms Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/direct": {
      "post": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Create Or Get Direct Chat Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/direct": {
      "post": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Create Or Get Direct Chat Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/chat/members": {
      "get": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Get Grade Members Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/messages": {
      "get": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Get Room Messages Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Send Room Message Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/mentions": {
      "get": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Search Room Mentions Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/messages/{message_id}": {
      "patch": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Edit Room Message Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          },
          {
            "name": "message_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for message_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/messages/{message_id}/unsend": {
      "delete": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Unsend Room Message Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          },
          {
            "name": "message_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for message_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/messages/{message_id}/delete-for-me": {
      "delete": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Delete Room Message For Me Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          },
          {
            "name": "message_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for message_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/clear": {
      "post": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Clear Room Chat Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/delete": {
      "post": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Delete Room Chat Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/for-me": {
      "delete": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Delete Room Chat Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/rooms/{room_id}/read": {
      "post": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Mark Room As Read Api",
        "parameters": [
          {
            "name": "room_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for room_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/chat/unread-count": {
      "get": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Get Unread Count Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/notifications": {
      "get": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Get Notifications Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/notifications/mark-all-read": {
      "post": {
        "tags": [
          "Chat & Messaging"
        ],
        "summary": "Mark All Notifications Read Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/getChatdocument": {
      "get": {
        "tags": [
          "Document AI Chat"
        ],
        "summary": "Get Document Chat Documents",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/createChatSessions": {
      "post": {
        "tags": [
          "Document AI Chat"
        ],
        "summary": "Create Document Chat Session",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/getChatSessions": {
      "get": {
        "tags": [
          "Document AI Chat"
        ],
        "summary": "List Document Chat Sessions",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/getChatMessagesbySessionId/{session_id}": {
      "get": {
        "tags": [
          "Document AI Chat"
        ],
        "summary": "Get Document Chat Messages",
        "parameters": [
          {
            "name": "session_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for session_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/createChatMessages/{session_id}": {
      "post": {
        "tags": [
          "Document AI Chat"
        ],
        "summary": "Send Document Chat Message",
        "parameters": [
          {
            "name": "session_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for session_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/grades/create_grade": {
      "post": {
        "tags": [
          "Grades"
        ],
        "summary": "Create Grade",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/grades/update_grade/{grade_id}": {
      "put": {
        "tags": [
          "Grades"
        ],
        "summary": "Update Grade",
        "parameters": [
          {
            "name": "grade_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for grade_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/grades/get_grade_by_id/{grade_id}": {
      "get": {
        "tags": [
          "Grades"
        ],
        "summary": "Get Grade By Id",
        "parameters": [
          {
            "name": "grade_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for grade_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/grades/get_all_grade": {
      "get": {
        "tags": [
          "Grades"
        ],
        "summary": "Get All Grade",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/grades/delete_grade/{grade_id}": {
      "delete": {
        "tags": [
          "Grades"
        ],
        "summary": "Delete Grade",
        "parameters": [
          {
            "name": "grade_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for grade_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisations/sync-otp": {
      "post": {
        "tags": [
          "Internal Sync"
        ],
        "summary": "Sync Candidate Otp",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/leaderboard/live-tests": {
      "get": {
        "tags": [
          "Leaderboard"
        ],
        "summary": "Get Live Tests Overview Endpoint",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/leaderboard/{assigned_test_id}": {
      "get": {
        "tags": [
          "Leaderboard"
        ],
        "summary": "Get Test Leaderboard Endpoint",
        "parameters": [
          {
            "name": "assigned_test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for assigned_test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/materials/upload_material": {
      "post": {
        "tags": [
          "Study Materials"
        ],
        "summary": "Upload Material",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/materials/get_all_materials": {
      "get": {
        "tags": [
          "Study Materials"
        ],
        "summary": "Get All Materials",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/materials/download_material/{material_id}": {
      "get": {
        "tags": [
          "Study Materials"
        ],
        "summary": "Download Material",
        "parameters": [
          {
            "name": "material_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for material_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/materials/file/{material_id}": {
      "get": {
        "tags": [
          "Study Materials"
        ],
        "summary": "Download Material File",
        "parameters": [
          {
            "name": "material_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for material_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/materials/delete_material/{material_id}": {
      "delete": {
        "tags": [
          "Study Materials"
        ],
        "summary": "Delete Material",
        "parameters": [
          {
            "name": "material_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for material_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/notifications/unread-count": {
      "get": {
        "tags": [
          "Notifications"
        ],
        "summary": "Get Unread Count Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/notifications/read-all": {
      "patch": {
        "tags": [
          "Notifications"
        ],
        "summary": "Mark All Read Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/notifications": {
      "get": {
        "tags": [
          "Notifications"
        ],
        "summary": "Get Notifications Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/notifications/{notification_id}/read": {
      "patch": {
        "tags": [
          "Notifications"
        ],
        "summary": "Mark Single Read Api",
        "parameters": [
          {
            "name": "notification_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for notification_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/login": {
      "post": {
        "tags": [
          "Organisation Admin Auth"
        ],
        "summary": "Login Organisation User Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/refresh-access-token": {
      "post": {
        "tags": [
          "Organisation Admin Auth"
        ],
        "summary": "Refresh Access Token Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-color-grade/create-organisation-color-grade": {
      "post": {
        "tags": [
          "Branding (Color Grade)"
        ],
        "summary": "Create Organisation Color Grade",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-color-grade/update-organisation-color-grade": {
      "put": {
        "tags": [
          "Branding (Color Grade)"
        ],
        "summary": "Update Organisation Color Grade",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-color-grade/delete-organisation-color-grade": {
      "delete": {
        "tags": [
          "Branding (Color Grade)"
        ],
        "summary": "Delete Organisation Color Grade",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-color-grade/get-organisation-color-grade": {
      "get": {
        "tags": [
          "Branding (Color Grade)"
        ],
        "summary": "Get Organisation Color Grade",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/organisation-dashboard": {
      "post": {
        "tags": [
          "Organisation Dashboard"
        ],
        "summary": "Organisation Dashboard Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/documents": {
      "post": {
        "tags": [
          "Organisation Documents"
        ],
        "summary": "Upload Document Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "get": {
        "tags": [
          "Organisation Documents"
        ],
        "summary": "Get All Documents Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/documents/{file_id}": {
      "delete": {
        "tags": [
          "Organisation Documents"
        ],
        "summary": "Delete Document Api",
        "parameters": [
          {
            "name": "file_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for file_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/documents/bulk-delete": {
      "post": {
        "tags": [
          "Organisation Documents"
        ],
        "summary": "Bulk Delete Documents Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-logo/add-logo": {
      "post": {
        "tags": [
          "Branding (Logo)"
        ],
        "summary": "Add Logo",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-logo/update-logo": {
      "put": {
        "tags": [
          "Branding (Logo)"
        ],
        "summary": "Update Logo",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-logo/get-logo": {
      "get": {
        "tags": [
          "Branding (Logo)"
        ],
        "summary": "Get Logo",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-logo/delete-logo": {
      "delete": {
        "tags": [
          "Branding (Logo)"
        ],
        "summary": "Delete Logo",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/subadmins": {
      "post": {
        "tags": [
          "Organisation Subadmins"
        ],
        "summary": "Create Subadmin Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "get": {
        "tags": [
          "Organisation Subadmins"
        ],
        "summary": "Get All Subadmins Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/subadmins/{subadmin_id}": {
      "get": {
        "tags": [
          "Organisation Subadmins"
        ],
        "summary": "Get Subadmin Api",
        "parameters": [
          {
            "name": "subadmin_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subadmin_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "Organisation Subadmins"
        ],
        "summary": "Update Subadmin Api",
        "parameters": [
          {
            "name": "subadmin_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subadmin_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Organisation Subadmins"
        ],
        "summary": "Delete Subadmin Api",
        "parameters": [
          {
            "name": "subadmin_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subadmin_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/subadmins/{subadmin_id}/block": {
      "post": {
        "tags": [
          "Organisation Subadmins"
        ],
        "summary": "Block Sub Admin Route",
        "parameters": [
          {
            "name": "subadmin_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subadmin_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/subadmins/{subadmin_id}/unblock": {
      "post": {
        "tags": [
          "Organisation Subadmins"
        ],
        "summary": "Unblock Sub Admin Route",
        "parameters": [
          {
            "name": "subadmin_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subadmin_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/tests/generate": {
      "post": {
        "tags": [
          "Organisation Tests"
        ],
        "summary": "Generate Test Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/tests": {
      "get": {
        "tags": [
          "Organisation Tests"
        ],
        "summary": "List Tests Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/tests/{test_id}": {
      "get": {
        "tags": [
          "Organisation Tests"
        ],
        "summary": "Get Test Api",
        "parameters": [
          {
            "name": "test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Organisation Tests"
        ],
        "summary": "Delete Test Api",
        "parameters": [
          {
            "name": "test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/test-results": {
      "get": {
        "tags": [
          "Organisation Test Results"
        ],
        "summary": "Get Test Results Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/test-results/{assigned_test_id}": {
      "get": {
        "tags": [
          "Organisation Test Results"
        ],
        "summary": "Get Each Student Test Result Api",
        "parameters": [
          {
            "name": "assigned_test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for assigned_test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/reels/add_reels": {
      "post": {
        "tags": [
          "Reels & Video Bites"
        ],
        "summary": "Add Reels",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/reels/get_all_reels": {
      "get": {
        "tags": [
          "Reels & Video Bites"
        ],
        "summary": "Get All Reels",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/reels/update_reel_caption/{reel_id}": {
      "put": {
        "tags": [
          "Reels & Video Bites"
        ],
        "summary": "Update Reel Caption",
        "parameters": [
          {
            "name": "reel_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for reel_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/reels/delete_reel/{reel_id}": {
      "delete": {
        "tags": [
          "Reels & Video Bites"
        ],
        "summary": "Delete Reel",
        "parameters": [
          {
            "name": "reel_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for reel_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/organisation-admin/bulk-candidate-uploads/candidates": {
      "post": {
        "tags": [
          "Bulk Candidate Uploads"
        ],
        "summary": "Create Candidates",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/student/assigned-tests": {
      "get": {
        "tags": [
          "Student Tests & Assignments"
        ],
        "summary": "Get Student Assigned Tests Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/assigned-tests/{assigned_test_id}": {
      "get": {
        "tags": [
          "Student Tests & Assignments"
        ],
        "summary": "Get Student Assigned Test By Id Api",
        "parameters": [
          {
            "name": "assigned_test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for assigned_test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/color-grade/get-student-color_grade": {
      "get": {
        "tags": [
          "Branding (Color Grade)"
        ],
        "summary": "Get Student Color Grade",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/logo/get-student-logo": {
      "get": {
        "tags": [
          "Branding (Logo)"
        ],
        "summary": "Get Student Logo",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/materials/get_all_materials": {
      "get": {
        "tags": [
          "Study Materials"
        ],
        "summary": "Get All Materials Student",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/materials/download_material/{material_id}": {
      "get": {
        "tags": [
          "Study Materials"
        ],
        "summary": "Download Material Student",
        "parameters": [
          {
            "name": "material_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for material_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/reels/get_all_reels": {
      "get": {
        "tags": [
          "Reels & Video Bites"
        ],
        "summary": "Get All Reels Student",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/reels/save_reel_by_reel_id/{reel_id}": {
      "post": {
        "tags": [
          "Reels & Video Bites"
        ],
        "summary": "Save Reel By Reel Id",
        "parameters": [
          {
            "name": "reel_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for reel_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/student/reels/get_all_saved_reels_by_student": {
      "get": {
        "tags": [
          "Reels & Video Bites"
        ],
        "summary": "Get All Saved Reels By Student",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/assigned-tests/{assigned_test_id}/study-summary": {
      "get": {
        "tags": [
          "Student Tests & Assignments"
        ],
        "summary": "Get Student Study Summary Api",
        "parameters": [
          {
            "name": "assigned_test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for assigned_test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/tests/{assigned_test_id}/start": {
      "post": {
        "tags": [
          "Student Test Attempts"
        ],
        "summary": "Start Test Api",
        "parameters": [
          {
            "name": "assigned_test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for assigned_test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/student/tests/{assigned_test_id}/retests": {
      "post": {
        "tags": [
          "Student Test Attempts"
        ],
        "summary": "Start Retest Api",
        "parameters": [
          {
            "name": "assigned_test_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for assigned_test_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/student/test-attempts/{attempt_id}/submit": {
      "post": {
        "tags": [
          "Student Test Attempts"
        ],
        "summary": "Submit Test Api",
        "parameters": [
          {
            "name": "attempt_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for attempt_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/student/test-history": {
      "get": {
        "tags": [
          "Student Test Attempts"
        ],
        "summary": "Get Student Test History Api",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/test-attempts/{subject_id}/result": {
      "get": {
        "tags": [
          "Student Test Attempts"
        ],
        "summary": "Get Subject Result Api",
        "parameters": [
          {
            "name": "subject_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subject_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/student/usage/summary": {
      "get": {
        "tags": [
          "Student Usage Analytics"
        ],
        "summary": "Get Student Usage Summary",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/subjects/add_subject": {
      "post": {
        "tags": [
          "Subjects"
        ],
        "summary": "Add Subject",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/subjects/update_subject/{subject_id}": {
      "put": {
        "tags": [
          "Subjects"
        ],
        "summary": "Update Subject",
        "parameters": [
          {
            "name": "subject_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subject_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/api/subjects/get_subject_by_id/{subject_id}": {
      "get": {
        "tags": [
          "Subjects"
        ],
        "summary": "Get Subject By Id",
        "parameters": [
          {
            "name": "subject_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subject_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/subjects/get_all_subject": {
      "get": {
        "tags": [
          "Subjects"
        ],
        "summary": "Get All Subject",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/subjects/delete_subject/{subject_id}": {
      "delete": {
        "tags": [
          "Subjects"
        ],
        "summary": "Delete Subject",
        "parameters": [
          {
            "name": "subject_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Identifier for subject_id"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/": {
      "get": {
        "tags": [
          "Root & Health"
        ],
        "summary": "Root Health Check",
        "responses": {
          "200": {
            "description": "Service running"
          }
        }
      }
    },
    "/health": {
      "get": {
        "tags": [
          "Root & Health"
        ],
        "summary": "Service Health Probe",
        "responses": {
          "200": {
            "description": "Healthy"
          }
        }
      }
    }
  }
};

export const getSwaggerHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ReckomateAI Organisation Backend - Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://fastapi.tiangolo.com/img/favicon.png" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
    }
    .topbar {
      display: none;
    }
    .swagger-ui .info {
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "list",
        filter: true
      });
    };
  </script>
</body>
</html>`;

export default { openApiSpec, getSwaggerHtml };
