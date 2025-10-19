1. CLIENT LAYER
    - our frontend, for now we are using a normal vanilla html, css and javascript frontend setup. If im not wrong we can switch to a nuxt framework later on which the file structure caters to.
    - where the user interacts and clicks and sees shit
    - where user log ins happen also, based on my understanding what happens is this:
        * the user's browser sends the log in information to this thing called firebase authentication. the firebase authentication will verify whether the user is good or not, and then when it does it will send back this thing called a token to the user's browser (like a hall pass lahh).
    - the client layer will attach this token to the http requests that it will make to the backend-for-frontend layer
2. BACKEND-FOR-FRONTEND LAYER
    - one BIGASS API for us
    - we will use this mainly to verify the token sent from the client layer
    - to handle the business logic / rules we set in the google project proposal (like any seat reservation limitations, time limits, community forum logic, etc.). Basically where most of our logic lies in
    - this layer's also in charge of calling our external api's and database to get whatever data is needed
    - once data processing is done it will send back the http response to client layer so that the user will see it
3. EXTERNAL SERVICES
    - backend for frontend will call this
    - where all of our public api's will be (google cloud vision api, stripe api, etc.)
4. DATABASE LAYER
    - backend for frontend will call on this also if we need data that is stored in our database
    - we can use either firebase firestore, postgresql, or both ah i think we can decide later
    - our data can consist of like seats data, reservation records, order records, user data, reviews, community forum data, etc.