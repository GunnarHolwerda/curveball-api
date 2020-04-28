export enum QuizEvents {
    audienceCount = 'audience_count',
    userConnected = 'user_connected',
    userDisconnected = 'user_disconnected',
    question = 'question',
    results = 'results',
    winners = 'winners'
}

export enum ServerEvents {
    quizStart = 'start'
}

export enum AnalyticsEvents {
    login = 'Login',
    signup = 'Sign up',
    usedPowerup = 'Used Powerup',
    answeredQuestion = 'Answered Question',
    joinedShow = 'Joined Show',
    leftShow = 'Left Show',
    reachedEndOfShow = 'Reached End of Show'
}