import { QuestionFactory } from '../../../models/factories/question-factory';
import { User } from '../../../models/entities/user';
import { generatePhone } from '../../../util/generate-phone';
import { Answer } from '../../../models/entities/answer';
import { Request } from 'hapi';
import * as Boom from 'boom';
import { UserFactory } from '../../../models/factories/user-factory';


function getRandomElement<T>(items: Array<T>): T {
    return items[Math.floor(Math.random() * items.length)];
}

export async function generateRandomAnswers(req: Request): Promise<any> {
    const { questionId, numAnswers } = req.payload as { questionId: string, numAnswers: number };
    const question = await QuestionFactory.load(questionId);
    if (!question) {
        throw Boom.notFound();
    }
    const choices = await question.choices();
    const percentageChoices: { [choiceId: string]: number } = {};
    let percentageLeft = 1;
    for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (i === choices.length - 1) {
            percentageChoices[choice.properties.choice_id] = percentageLeft;
        } else {
            const percentageForChoice = Math.random() * percentageLeft;
            percentageChoices[choice.properties.choice_id] = percentageForChoice;
            percentageLeft -= percentageForChoice;
        }
    }
    const numSelected: { [choiceId: string]: number } = choices.reduce((carry, choice) => {
        carry[choice.properties.choice_id] = 0;
        return carry;
    }, {});

    const answerPromises: Array<Promise<any>> = [];
    const quizId = question.properties.quiz_id;
    for (let i = 0; i < numAnswers; i++) {
        answerPromises.push(new Promise((res, rej) => {
            User.create(generatePhone())
                .then(userId => UserFactory.load(userId) as Promise<User>)
                .then(u => {
                    let choice = getRandomElement(choices);
                    while ((numSelected[choice.properties.choice_id] / numAnswers) > percentageChoices[choice.properties.choice_id]) {
                        choice = getRandomElement(choices);
                    }
                    numSelected[choice.properties.choice_id]++;
                    Answer.create(quizId, questionId, u.properties.user_id, choice.properties.choice_id).then((a) => {
                        res(a);
                    }).catch(rej);
                }).catch(rej);
        }));
    }
    try {
        await Promise.all(answerPromises);
        return {
            ...percentageChoices
        };
    } catch (e) {
        console.error(e);
        throw Boom.internal('Something went wrong generating answers');
    }
}