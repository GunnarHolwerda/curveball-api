
import * as hapi from 'hapi';
import * as Joi from 'joi';

export const getSubjectsQuerySchema = {
    topicId: Joi.number().required().description('The topic id to retrieve related subjects for'),
    typeId: Joi.number().required().description('The question type to filter down subjects to')
};

export async function getSubjects(event: hapi.Request): Promise<object> {
    // const { topicId, typeId } = event.query as { topicId: string, typeId: string };

    // return {
    //     user: user.toResponseObject(),
    //     stats
    // };
    return event;
}


