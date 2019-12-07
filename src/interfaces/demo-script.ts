export interface DemoScript {
    name: string;
    videoUrl: string;
    schedule: Array<number>; // Array of timestamps when each question in the script should be sent
    script: Array<DemoQuestion>;
}

export interface DemoQuestion {
    question: string;
    type: string;
    answers: Array<{ text: string }>;
}