/**
 * 使用 Qwen 模型进行文本翻译
 * @param {string} text - 要翻译的文本
 * @param {string} from - 源语言代码，如 'zh_cn'
 * @param {string} to - 目标语言代码，如 'en'
 * @param {object} options - 包含配置和工具的对象
 * @param {object} options.config - 配置对象
 * @param {string} options.config.apiKey - Qwen 的 API Key
 * @param {string} options.config.modelName - 用户选择的模型名称
 * @param {object} options.utils - 工具对象
 * @param {function} options.utils.fetch - tauriFetch重命名成fetch,用于发送 HTTP 请求的函数
 */
async function translate(text, from, to, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;
    const { apiKey, modelName } = config;

    // 检查 API Key 是否存在
    if (!apiKey || apiKey.length === 0) {
        throw "请填写你的qwen API key.";
    }

    // 如果用户没有选择模型，提供一个默认值
    if (!modelName) {
        modelName = "qwen-mt-turbo"; // 默认使用 Qwen MT Turbo 模型
    }

    // Qwen 的兼容模式 API 地址
    const url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

    // 构建基本的请求体
    const body = {
        model: modelName,
        messages: [
            {
                role: "user",
                content: text,
            },
        ],
    };

    // 针对翻译模型，直接将 translation_options 添加到 body 的顶层
    if (modelName.startsWith("qwen-mt-")) {
        // 使用 Object.assign 将翻译选项合并到 body 对象中
        Object.assign(body, {
            translation_options: {
                source_lang: `${from}`,
                target_lang: `${to}`,
            },
        });
    }

    // 发送 POST 请求
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: {
            type: 'Json',
            payload: body
        },
    });

    if (res.ok) {
        const result = res.data;
        // 响应数据结构与官方 SDK 示例一致
        const translatedText = result.choices?.[0]?.message?.content;

        if (translatedText) {
            return translatedText;
        } else {
            throw `Qwen API Error: 在响应中未找到翻译内容。\nResponse: ${JSON.stringify(result)}`;
        }
    } else {
        throw `Qwen API Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

