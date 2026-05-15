import api from './axios';

export const generateVideo = async (subject, topic, options = {}) => {
    try {
        const response = await api.post('/video/generate', {
            subject,
            topic,
            style: options.style || 'normal',
            use_veo: options.use_veo || false,
            veo_prompt: options.veo_prompt || ""
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const generateSequenceVideo = async (subject, options = {}) => {
    try {
        const response = await api.post('/video/sequence', {
            subject,
            use_veo: options.use_veo || false,
            veo_prompt: options.veo_prompt || ""
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
