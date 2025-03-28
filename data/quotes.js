const quotes = [
    {
        id: '1',
        quote: "菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。",
        author: "慧能",
        source: "六祖坛经",
        tags: ["禅宗", "顿悟", "智慧"],
        explanation: "这是禅宗六祖慧能的成名偈语，揭示了禅宗的核心思想。'菩提'象征觉悟，'明镜'象征心灵。此偈指出修行的本质不在外相，而在于明心见性。当我们放下所有执着和分别心，返归本来清净的自性时，哪里还会有烦恼尘埃？这启示我们不要执着于外在的修行形式，而要直指本心，明白万法皆空的道理。",
        likes: 286,
        comments: 45,
        shares: 158,
        collections: 196,
        isLiked: false,
        isCollected: false
    },
    {
        id: '2',
        quote: "春有百花秋有月，夏有凉风冬有雪。若无闲事挂心头，便是人间好时节。",
        author: "无门慧开",
        source: "无门关",
        tags: ["禅意", "生活", "智慧"],
        explanation: "这首偈语描绘了四季轮回的自然之美，更深层次地揭示了心境与万物的关系。当我们的心不被杂念所困，不被烦恼所扰，便能真正感受生活中每个季节的美好。这告诉我们，美好的生活不在于外在环境的改变，而在于内心的清净无染。只要心中没有挂碍，处处都是美景，时时都是好时节。",
        likes: 245,
        comments: 38,
        shares: 120,
        collections: 150,
        isLiked: false,
        isCollected: false
    },
    {
        id: '3',
        quote: "不是风动，不是幡动，仁者心动。",
        author: "六祖慧能",
        source: "六祖坛经",
        tags: ["禅宗", "觉悟", "智慧"],
        explanation: "这是六祖慧能在听到两个僧人争论风幡动摇时说的话。它揭示了一个深刻的道理：我们所见的外界现象，往往是内心投射的结果。不是风在动，也不是幡在动，而是我们的心在动。这提醒我们要反观自心，明白一切境界都是由心所现，从而超越二元对立的分别心，达到真正的觉悟境界。",
        likes: 198,
        comments: 32,
        shares: 100,
        collections: 120,
        isLiked: false,
        isCollected: false
    },
    {
        id: '4',
        quote: "心中有光明，脚下有力量。",
        author: "佛偈",
        source: "佛经",
        tags: ["禅意", "智慧", "修行"],
        explanation: "这句话揭示了内在觉醒与外在行动的关系。'心中有光明'指的是内心保持清澈、觉知和智慧，就像黑暗中的明灯；'脚下有力量'则表明当我们内心明晰时，行动自然坚定有力。这告诉我们，真正的力量源于内心的觉醒与清明，而不是外在的条件。当我们保持内心的光明时，面对人生的种种挑战，自然能够从容应对，步伐坚定。",
        likes: 90,
        comments: 19,
        shares: 50,
        collections: 70,
        isLiked: false,
        isCollected: false
    },
    {
        id: '5',
        quote: "不要用战术上的勤奋，掩盖战略上的懒惰。",
        author: "王阳明",
        source: "传习录",
        tags: ["思考", "智慧", "人生"],
        explanation: "这句话道破了许多人在生活和工作中的误区。'战术上的勤奋'指的是在具体事务上的忙碌和投入，而'战略上的懒惰'则指在更高层面上缺乏思考和规划。很多人常常陷入日常事务的忙碌中，却忽视了对人生方向的思考和规划。这提醒我们，真正的效率不在于表面的忙碌，而在于是否在做正确的事情。需要时常跳出细节，从更高的维度审视自己的人生方向。",
        likes: 156,
        comments: 42,
        shares: 80,
        collections: 100,
        isLiked: false,
        isCollected: false
    },
    {
        id: '6',
        quote: "种一棵树最好的时间是十年前，其次是现在。",
        author: "佚名",
        source: "谚语",
        tags: ["行动", "智慧", "人生"],
        explanation: "这句谚语蕴含着深刻的人生智慧。它告诉我们两个重要的道理：第一，做有价值的事情需要时间的积累，越早开始越好；第二，即使错过了最好的时机，现在开始也不晚。很多人常常因为觉得已经太晚而放弃开始，但其实，只要开始行动，任何时候都是新的起点。这句话既包含着对过去的惋惜，也充满着对未来的希望，更重要的是指引我们把握当下，立即行动。",
        likes: 208,
        comments: 35,
        shares: 90,
        collections: 110,
        isLiked: false,
        isCollected: false
    },
    {
        id: '7',
        quote: "我们终将成为我们所追求的样子。",
        author: "马可·奥勒留",
        source: "沉思录",
        tags: ["哲学", "成长", "人生"],
        explanation: "这句话揭示了人生塑造的真谛。我们每个人都是通过日常的选择和行动在塑造自己，我们的思想、行为和追求，最终会将我们带向相应的人生境界。这提醒我们要谨慎对待每一个选择，因为这些选择不仅影响当下，更在潜移默化中决定着我们未来的样子。如果我们追求智慧，就会逐渐变得智慧；如果我们追求平和，就会逐渐变得平和。我们的追求就是我们未来的投影。",
        likes: 175,
        comments: 28,
        shares: 70,
        collections: 90,
        isLiked: false,
        isCollected: false
    },
    {
        id: '8',
        quote: "把所有的失望打包送给昨天，把所有的希望打包送给明天，只剩下一个轻装的今天。",
        author: "泰戈尔",
        source: "飞鸟集",
        tags: ["诗意", "生活", "智慧"],
        explanation: "这是一个关于如何活在当下的智慧箴言。它告诉我们不要被过去的失望所困扰，也不要被对未来的期待所拖累。'轻装的今天'意味着一种轻松自在的生活状态，当我们放下对过去的执着和对未来的焦虑，就能更好地感受和把握当下的每一刻。这不是逃避责任，而是一种更明智的生活态度：既不沉溺于过去，也不过分忧虑未来，而是专注于现在，活出生命的真实与美好。",
        likes: 162,
        comments: 31,
        shares: 60,
        collections: 80,
        isLiked: false,
        isCollected: false
    },
    {
        id: '9',
        quote: "内心的强大，就是明白人生没有假设。",
        author: "星云大师",
        source: "人生没有假设",
        tags: ["禅意", "人生", "智慧"],
        explanation: "这句话道出了人生的一个重要真相：我们常常在'如果'和'要是'的假设中徘徊，但真实的人生只有一个版本，那就是正在发生的这一个。内心的强大不在于能够改变过去或预知未来，而在于能够接受现实的本来面目，并在此基础上继续前行。当我们不再沉迷于虚幻的假设，而是把精力放在当下能做的事情上时，我们就真正强大了。这种领悟让我们能够更坦然地面对人生的种种际遇，无论顺境还是逆境。",
        likes: 145,
        comments: 25,
        shares: 50,
        collections: 70,
        isLiked: false,
        isCollected: false
    },
    {
        id: '10',
        quote: "生活不是等待暴风雨过去，而是学会在雨中翩翩起舞。",
        author: "维维安·格林",
        source: "生活的艺术",
        tags: ["生活", "智慧", "乐观"],
        explanation: "这句话颠覆了我们对困境的传统认知。很多人认为生活就是等待困难过去，等待好时机的到来。但这句话告诉我们，生活的真谛不在于逃避困难，而在于在困境中找到生活的美好。'在雨中翩翩起舞'象征着一种积极的生活态度，它教导我们即使在困境中也要保持优雅和从容，找到属于自己的生活节奏。这不仅是一种生活智慧，更是一种生存艺术，教会我们如何在不完美的现实中创造完美的人生。",
        likes: 189,
        comments: 37,
        shares: 90,
        collections: 110,
        isLiked: false,
        isCollected: false
    }
];

// 获取随机偈语
const getRandomQuote = () => {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
};

// 获取所有偈语
const getAllQuotes = () => {
    return quotes;
};

// API接口封装
const fetchQuoteFromAPI = () => {
    // TODO: 实现API调用
    return Promise.resolve(getRandomQuote());
};

export {
    quotes as default,
    getRandomQuote,
    getAllQuotes,
    fetchQuoteFromAPI
}; 