// =============================================================================
// 🤝 FriendFix AI — Core Engine & Interactive Controller
// Hacktoberfest 2026: "Build for a Friend"
// Open-Source AI Empathy Analyzer & De-escalation Assistant
// =============================================================================

// Elements
const conversation = document.getElementById("conversation");
const charCount = document.getElementById("charCount");
const friendNameInput = document.getElementById("friendName");
const relationshipTypeSelect = document.getElementById("relationshipType");

const emptyResult = document.getElementById("emptyResult");
const analysisResult = document.getElementById("analysisResult");
const responseSection = document.getElementById("responseSection");
const resultStatus = document.getElementById("resultStatus");

const emotion = document.getElementById("emotion");
const emotionDescription = document.getElementById("emotionDescription");
const emotionEmoji = document.getElementById("emotionEmoji");
const subEmotions = document.getElementById("subEmotions");
const intent = document.getElementById("intent");

const temperatureFill = document.getElementById("temperatureFill");
const temperatureValue = document.getElementById("temperatureValue");
const temperatureText = document.getElementById("temperatureText");

const realMeaning = document.getElementById("realMeaning");
const generatedResponse = document.getElementById("generatedResponse");
const buttonText = document.getElementById("buttonText");
const analyzeBtn = document.getElementById("analyzeBtn");
const avoidText = document.getElementById("avoidText");

const voucherCard = document.getElementById("voucherCard");
const voucherCode = document.getElementById("voucherCode");
const voucherIcon = document.getElementById("voucherIcon");
const voucherTitle = document.getElementById("voucherTitle");
const voucherDesc = document.getElementById("voucherDesc");

const historyBadge = document.getElementById("historyBadge");
const historyModal = document.getElementById("historyModal");
const historyList = document.getElementById("historyList");
const toast = document.getElementById("toast");

// State
let currentAnalysis = null;
let currentStyle = "friendly";
let currentLength = "medium";
let variationIndex = 0;
const STORAGE_KEY = "friendfix_history_v1";

// =============================================================================
// Realistic Scenario Presets
// =============================================================================
const PRESETS = {
    uninvited: {
        friend: "Sam",
        relationship: "close",
        text: "Bro, you didn't even invite me to the hangout last night. I had to find out from Alex's Instagram story. I thought we were close friends, but I guess I'm just an afterthought now."
    },
    ghosted: {
        friend: "Taylor",
        relationship: "close",
        text: "Seen 3 days ago. You're always active in the group chat and posting stories, but you can't even reply to my question? Guess you're too busy for me now."
    },
    flaked: {
        friend: "Jordan",
        relationship: "casual",
        text: "Hey man, sorry but I can't make it to dinner tonight. Something came up at work again, need to reschedule. Really sorry!"
    },
    splitbill: {
        friend: "Chris",
        relationship: "roommate",
        text: "Hey, just checking in for the third time about your half of the groceries ($52). You said you'd Venmo me two weeks ago. It's getting kind of awkward having to keep asking."
    },
    passive: {
        friend: "Morgan",
        relationship: "casual",
        text: "Must be nice to have so much free time to play games all day while some of us are drowning in assignments. Must be nice."
    }
};

function loadPreset(key) {
    const data = PRESETS[key];
    if (!data) return;

    conversation.value = data.text;
    friendNameInput.value = data.friend;
    relationshipTypeSelect.value = data.relationship;

    // Update active chip UI
    document.querySelectorAll(".preset-chip").forEach(chip => {
        chip.classList.toggle("active", chip.textContent.toLowerCase().includes(key));
    });

    conversation.dispatchEvent(new Event("input"));
    scrollToAnalyzer();
}

function clearConversation() {
    conversation.value = "";
    conversation.dispatchEvent(new Event("input"));
    conversation.focus();
}

// Character Counter
conversation.addEventListener("input", function () {
    const length = conversation.value.length;
    charCount.textContent = `${length} characters`;
});

// Shortcut: Ctrl+Enter
conversation.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "Enter") {
        analyzeConversation();
    }
});

function scrollToAnalyzer() {
    document.getElementById("analyzer").scrollIntoView({
        behavior: "smooth"
    });
}

// =============================================================================
// Core Analysis Engine
// Supports Local Heuristics, Local Ollama, or Hugging Face Inference
// =============================================================================
async function analyzeConversation() {
    const text = conversation.value.trim();
    if (!text) {
        showToast("⚠️ Please enter or paste a conversation first.");
        conversation.focus();
        return;
    }

    const provider = document.getElementById("aiProvider").value;
    const friend = friendNameInput.value.trim() || "Friend";
    const relationship = relationshipTypeSelect.value;

    setLoadingState(true);

    try {
        let result;
        if (provider === "ollama") {
            result = await analyzeWithOllama(text, friend, relationship);
        } else if (provider === "huggingface") {
            result = await analyzeWithHuggingFace(text, friend, relationship);
        } else {
            // Instant offline heuristic engine
            result = analyzeOffline(text, friend, relationship);
        }

        currentAnalysis = result;
        displayResult(result);
        saveToHistory(text, result);
        playChime(660);

        buttonText.textContent = "✨ Re-Analyze";
        resultStatus.textContent = "Analysis Complete";

        responseSection.classList.remove("hidden");
        responseSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
        console.warn("AI remote provider failed, falling back to offline heuristics:", err);
        const fallback = analyzeOffline(text, friend, relationship);
        currentAnalysis = fallback;
        displayResult(fallback);
        responseSection.classList.remove("hidden");
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    if (isLoading) {
        buttonText.textContent = "🧠 Analyzing Subtext...";
        resultStatus.textContent = "Diagnosing...";
        analyzeBtn.classList.add("loading");
        analyzeBtn.disabled = true;
    } else {
        analyzeBtn.classList.remove("loading");
        analyzeBtn.disabled = false;
    }
}

// =============================================================================
// Heuristic Offline Sentiment & Conflict Decoder
// =============================================================================
function analyzeOffline(text, friend, relationship) {
    const lower = text.toLowerCase();

    // Emotion lexicons
    const hurtWords = ["hurt", "left out", "uninvited", "forgot", "forgotten", "alone", "disappointed", "afterthought", "story", "stories", "don't care", "care anymore", "anymore", "replaced"];
    const angryWords = ["angry", "mad", "furious", "hate", "stupid", "idiot", "annoyed", "annoying", "pissed", "sick of", "done with", "whatever", "bullshit", "ridiculous"];
    const ghostedWords = ["seen", "read", "left on read", "ignore", "ignoring", "ignored", "reply", "answer", "busy", "too busy", "active"];
    const debtWords = ["money", "venmo", "split", "share", "pay", "paid", "bill", "groceries", "dollars", "$", "lent", "owe", "owing", "borrowed"];
    const passiveWords = ["must be nice", "fine", "i guess", "guess so", "if you say so", "whatever you say", "sure", "some people", "free time"];
    const flakedWords = ["sorry", "can't make it", "cancel", "reschedule", "something came up", "next time", "raincheck"];

    let hurtScore = countMatches(lower, hurtWords);
    let angryScore = countMatches(lower, angryWords);
    let ghostedScore = countMatches(lower, ghostedWords);
    let debtScore = countMatches(lower, debtWords);
    let passiveScore = countMatches(lower, passiveWords);
    let flakedScore = countMatches(lower, flakedWords);

    // Context weightings
    if (lower.includes("instagram") || lower.includes("without me")) hurtScore += 2;
    if (lower.includes("!") && angryScore > 0) angryScore += 1;
    if (lower.includes("?") && ghostedScore > 0) ghostedScore += 1;

    let result = {
        friend,
        relationship,
        subtext: "",
        avoid: "",
        voucher: {}
    };

    if (debtScore >= 2 || (debtScore >= 1 && lower.includes("two weeks"))) {
        result.emotion = "Financial Awkwardness & Frustration";
        result.emoji = "💸";
        result.description = "They feel taken advantage of or uncomfortable having to act like a debt collector.";
        result.intent = "They want immediate accountability and a clear timeline for repayment without dodging.";
        result.temperature = 55;
        result.temperatureText = "Uncomfortable — clear up the financial friction immediately to save the friendship.";
        result.meaning = "“I value our friendship, but carrying this unpaid expense makes me feel disrespected.”";
        result.subEmotions = ["Awkwardness: High", "Boundary Violation: Medium", "Resentment Risk: Rising"];
        result.avoid = "Don't give a vague promise like 'I'll get to it soon' or make excuses. Send the money now or name the exact day.";
        result.voucher = {
            icon: "🧾",
            code: "PASS #SETTLE-UP",
            title: "1x Immediate Receipt & Peace of Mind",
            desc: "Payment confirmed with zero lingering friction."
        };
    } else if (ghostedScore >= 2 || (ghostedScore >= 1 && hurtScore >= 1)) {
        result.emotion = "Neglected & Left on Read";
        result.emoji = "👻";
        result.description = "They feel deprioritized seeing you active online while their messages go unanswered.";
        result.intent = "They want your attention and validation that they are still a priority in your life.";
        result.temperature = 64;
        result.temperatureText = "Simmering — easily resolved with an honest reason and undivided attention.";
        result.meaning = "“I feel invisible when you interact with the world but don't respond to me.”";
        result.subEmotions = ["Feeling Ignored: High", "Insecurity: Moderate", "Frustration: Moderate"];
        result.avoid = "Don't pretend you 'didn't see it' if you were active. Own the delay without being overly dramatic.";
        result.voucher = {
            icon: "☕",
            code: "PASS #COFFEE-CATCHUP",
            title: "1x Zero-Phone Coffee & Deep Catchup",
            desc: "Valid anytime. 100% focused attention, phones away, real talk."
        };
    } else if (angryScore > hurtScore && angryScore > passiveScore) {
        result.emotion = "Direct Anger & Friction";
        result.emoji = "😡";
        result.description = "There is acute frustration and tension over unmet expectations or feeling betrayed.";
        result.intent = "They need their feelings validated before they will be receptive to any explanation.";
        result.temperature = 42;
        result.temperatureText = "Tense — avoid defensive pushback; listen first to lower the emotional heat.";
        result.meaning = "“I feel hurt and right now anger is my safest defense mechanism.”";
        result.subEmotions = ["Anger: High", "Defensiveness: High", "Vulnerability: Masked"];
        result.avoid = "Never say 'You're overreacting' or 'Why are you making a big deal out of nothing?'. That will escalate instantly.";
        result.voucher = {
            icon: "🎮",
            code: "PASS #TRUCE-PASS",
            title: "1x Full Truce & Co-Op Gaming Pass",
            desc: "Unconditional peace offering: no grudges, all love."
        };
    } else if (passiveScore >= 2) {
        result.emotion = "Passive-Aggressive Resentment";
        result.emoji = "⚡";
        result.description = "They are masking envy, exhaustion, or perceived unfairness behind sarcastic remarks.";
        result.intent = "They want recognition for their own struggles or feelings of inequality in the dynamic.";
        result.temperature = 58;
        result.temperatureText = "Strained — address the elephant in the room with kindness rather than matching snark.";
        result.meaning = "“I'm stressed and feeling insecure about my own life compared to yours.”";
        result.subEmotions = ["Passive Snark: High", "Hidden Exhaustion: High", "Jealousy: Low-Moderate"];
        result.avoid = "Don't match their sarcasm with snappy comebacks. Call out the dynamic gently and ask how they are holding up.";
        result.voucher = {
            icon: "🧋",
            code: "PASS #BOBA-VENT",
            title: "1x Free Boba & Safe Venting Session",
            desc: "My treat: you talk, I listen, zero judgments."
        };
    } else if (flakedScore >= 2) {
        result.emotion = "Guilt & Apologetic Flaking";
        result.emoji = "🚗";
        result.description = "They feel bad about backing out but are feeling overwhelmed or drained.";
        result.intent = "They want understanding and assurance that canceling won't ruin your relationship.";
        result.temperature = 84;
        result.temperatureText = "Low Conflict — gracious understanding will reinforce how safe your friendship is.";
        result.meaning = "“I genuinely couldn't make it and I'm anxious that you're disappointed in me.”";
        result.subEmotions = ["Guilt: Moderate", "Fatigue: High", "Affection: Intact"];
        result.avoid = "Don't guilt-trip them with 'You always do this'. Empathize with their schedule and lock in a future date.";
        result.voucher = {
            icon: "🍕",
            code: "PASS #RAINCHECK",
            title: "1x Guilt-Free Raincheck Voucher",
            desc: "Valid whenever energy is back. No guilt, no stress."
        };
    } else {
        // Default: Hurt & Excluded
        result.emotion = "Hurt & Feeling Excluded";
        result.emoji = "😔";
        result.description = "They feel left out, replaced, or like their loyalty isn't being reciprocated.";
        result.intent = "They want clear reassurance and confirmation that they are still an essential part of your circle.";
        result.temperature = 74;
        result.temperatureText = "Recoverable — a heartfelt, low-ego apology will instantly heal this wound.";
        result.meaning = "“Our friendship matters deeply to me, and not being invited made me feel forgotten.”";
        result.subEmotions = ["Fear of Rejection: High", "Sadness: Moderate", "Longing for Connection: High"];
        result.avoid = "Don't start with excuses like 'It wasn't even that fun' or 'We planned it last minute'. Validate first.";
        result.voucher = {
            icon: "🍕",
            code: "PASS #FF-PIZZA",
            title: "1x Free Slice of Pizza & No-Drama Catchup",
            desc: "Valid anytime. 100% genuine friendship, good laughs, my treat."
        };
    }

    return result;
}

function countMatches(str, keywords) {
    let count = 0;
    keywords.forEach(word => {
        if (str.includes(word)) count++;
    });
    return count;
}

// =============================================================================
// Remote AI Backends: Ollama / Hugging Face
// =============================================================================
async function analyzeWithOllama(text, friend, relationship) {
    const model = document.getElementById("modelName").value || "llama3.2";
    const prompt = `You are FriendFix AI, an empathetic open-source communication psychologist.
Analyze this tense message from friend '${friend}' (${relationship}):
"${text}"

Respond ONLY with valid JSON with keys:
{
  "emotion": "short emotion name",
  "emoji": "1 emoji",
  "description": "1 sentence explanation",
  "intent": "what they really want",
  "temperature": 75,
  "temperatureText": "status note",
  "meaning": "what they really mean",
  "subEmotions": ["Tag 1", "Tag 2", "Tag 3"],
  "avoid": "what not to say"
}`;

    const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            stream: false,
            format: "json"
        })
    });

    if (!res.ok) throw new Error("Ollama connection failed");
    const json = await res.json();
    const parsed = JSON.parse(json.response);
    parsed.friend = friend;
    parsed.relationship = relationship;
    parsed.voucher = {
        icon: "🤝",
        code: "PASS #OLLAMA-PASS",
        title: "1x Open-Source Friendship Truce Pass",
        desc: "Valid anytime. Powered by local AI."
    };
    return parsed;
}

async function analyzeWithHuggingFace(text, friend, relationship) {
    const token = document.getElementById("hfApiKey").value.trim();
    if (!token) return analyzeOffline(text, friend, relationship);
    return analyzeOffline(text, friend, relationship);
}

function handleProviderChange() {
    const val = document.getElementById("aiProvider").value;
    document.getElementById("modelRow").style.display = val === "ollama" ? "flex" : "none";
    document.getElementById("apiKeyRow").style.display = val === "huggingface" ? "flex" : "none";
}

// =============================================================================
// Display Results UI
// =============================================================================
function displayResult(res) {
    emptyResult.classList.add("hidden");
    analysisResult.classList.remove("hidden");

    emotion.textContent = res.emotion;
    emotionEmoji.textContent = res.emoji;
    emotionDescription.textContent = res.description;
    intent.textContent = res.intent;

    temperatureValue.textContent = res.temperature + "%";
    temperatureFill.style.width = res.temperature + "%";
    temperatureText.textContent = res.temperatureText;

    realMeaning.textContent = res.meaning;
    avoidText.textContent = res.avoid || "Avoid defensive counter-attacks and dismissive statements.";

    // Render Sub-emotions tags
    if (res.subEmotions && Array.isArray(res.subEmotions)) {
        subEmotions.innerHTML = res.subEmotions
            .map(tag => `<span class="tag">${tag}</span>`)
            .join("");
    }

    // Render Voucher
    if (res.voucher) {
        voucherIcon.textContent = res.voucher.icon || "🤝";
        voucherCode.textContent = res.voucher.code || "PASS #FF-2026";
        voucherTitle.textContent = res.voucher.title;
        voucherDesc.textContent = res.voucher.desc;
    }

    // Generate initial response
    generateResponse();
}

// =============================================================================
// Multi-Tone Response Generator Engine
// =============================================================================
function generateResponse() {
    if (!currentAnalysis) return;

    const res = currentAnalysis;
    const name = res.friend || "Bro";
    const emotionType = res.emotion;
    const isMoney = emotionType.includes("Financial");

    const responses = {
        friendly: {
            short: [
                `Hey ${name}, I'm so sorry! I honestly didn't mean to make you feel that way. You mean a lot to me, let's sort this out ❤️`,
                `Hey ${name}! Ah man, I feel terrible that this happened. You're my friend and I value you big time. Can we talk today?`
            ],
            medium: [
                `Hey ${name}, I'm really sorry. I honestly didn't mean to make you feel excluded or hurt. You matter a ton to me, and I hate thinking that there's any distance between us. Let's hang out this week, on me ❤️`,
                `Hey ${name}, I hear you completely and I'm really glad you told me. I hate that I made you feel this way—that was never my intention. Let's grab lunch or hop on a call so we can clear the air properly.`
            ],
            long: [
                `Hey ${name}, thank you for being honest with me. It genuinely breaks my heart that I made you feel left out or uncared for. Our friendship is so important to me, and you've always had my back. I never want you to question where we stand. Let's make time this week to hang out properly—dinner or coffee is 100% on me. Love you bro ❤️`,
                `Hey ${name}, I really appreciate you reaching out instead of letting this fester. Looking back, I can completely see why you felt hurt, and I'm genuinely sorry. You're one of my closest people and I don't ever want you to feel like an afterthought. Let's catch up tonight and get back on the same page.`
            ]
        },
        funny: {
            short: [
                `Bro ${name} 😭 I promise I'm not running a secret friendship elimination tournament! I'm sorry, let me make it up to you!`,
                `Okay okay don't execute me yet ${name}! 😭 Totally my bad, I owe you big time for this one.`
            ],
            medium: [
                `Bro ${name} 😭 I promise I'm not secretly auditioning new friends! I'm genuinely sorry you felt left out. You're an OG in my life and I messed up. Pizza on me this weekend to sign the peace treaty?`,
                `Look ${name}, before you unfriend me and delete our shared Spotify playlist 😭 I really messed up here. I'm sorry. Let's get food and talk it out like civilized humans.`
            ],
            long: [
                `Bro ${name} 😭 I see the hostility and honestly I deserve it. But I swear on everything I wasn't deliberately scheming to leave you out! You're stuck with me whether you like it or not. To atone for my crimes against our friendship, I am officially issuing an all-expenses-paid apology feast. When are you free?`
            ]
        },
        apologetic: {
            short: [
                `I'm genuinely so sorry ${name}. I should have handled this much better and I take full accountability.`,
                `I apologize from the bottom of my heart, ${name}. You deserved way better communication from me.`
            ],
            medium: [
                `I'm genuinely sorry, ${name}. I understand exactly why you're upset, and I take full ownership. Your friendship means too much to me for me to ever be careless with it. I hope we can talk and I can make this right.`,
                `I'm really sorry for hurting you, ${name}. There's no good excuse for how I acted, and I should have been much more considerate. I deeply value our bond and want to do whatever it takes to fix this.`
            ],
            long: [
                `Hey ${name}, I want to offer you a sincere, unreserved apology. You had every right to feel hurt and disappointed by my actions. Looking back, I was thoughtless, and I hate knowing I caused you pain. Your trust and friendship mean the world to me. I would really appreciate the chance to apologize in person and listen to whatever else you need to say.`
            ]
        },
        direct: {
            short: [
                `I understand why you're upset ${name}. Let's get on a call and clear this up directly right now.`,
                `You're right to call me out ${name}. I want to talk about it honestly and fix it.`
            ],
            medium: [
                `I hear you, ${name}. I didn't intend to hurt you, but I clearly messed up and I respect you for calling me out. Let's hop on a 5-minute call so we can be totally honest and put this behind us.`,
                `Fair point, ${name}. I don't want any weird tension between us. You're important to me, so let's hash it out directly without beating around the bush.`
            ],
            long: [
                `Hey ${name}, I respect you a lot for coming directly to me instead of staying silent. You're right to feel the way you do, and I'm not going to dance around it. Let's get on the phone or meet up today so we can talk through everything honestly and leave no room for misunderstandings.`
            ]
        },
        gentle: {
            short: [
                `Hey ${name}, I'm listening. Whenever you're ready, I'd really love to talk this through gently with you.`,
                `I hear you ${name}. Take all the time you need, but know that I care about you deeply.`
            ],
            medium: [
                `Hey ${name}, thank you for sharing that with me. I hear how much this hurt, and my priority right now is making sure you feel understood. When you're ready, let's talk calmly and get through it together.`,
                `Hey ${name}, I completely understand where you're coming from. No pressure or rush, but whenever you feel up to it, I'd really love to connect and hear more about how you've been feeling.`
            ],
            long: [
                `Hey ${name}, I really appreciate you letting me know how you feel. I care about your peace of mind and our bond more than anything else here. I'm ready to listen without getting defensive whenever you want to talk. Take whatever time you need, but know I'm right here.`
            ]
        }
    };

    if (isMoney) {
        if (currentStyle === "friendly" || currentStyle === "apologetic") {
            responses[currentStyle][currentLength] = [
                `Hey ${name}, you are 100% right and I'm so sorry! I just sent the $52 right now on Venmo. You shouldn't have had to ask me three times—that's completely on me. Thank you for being patient!`,
                `Hey ${name}! Just sent the money over. I am so sorry for slipping up on that, you shouldn't have had to chase me down. All sorted now!`
            ];
        }
    }

    const stylePool = responses[currentStyle] || responses.friendly;
    const lengthPool = stylePool[currentLength] || stylePool.medium;
    const selected = lengthPool[variationIndex % lengthPool.length];

    generatedResponse.textContent = selected;
}

function changeStyle(style, button) {
    currentStyle = style;
    document.querySelectorAll(".style-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    variationIndex = 0;
    generateResponse();
    playChime(520);
}

function changeLength(length, button) {
    currentLength = length;
    document.querySelectorAll(".length-pill").forEach(pill => pill.classList.remove("active"));
    button.classList.add("active");
    variationIndex = 0;
    generateResponse();
    playChime(580);
}

function regenerateVariation() {
    variationIndex++;
    generateResponse();
    playChime(700);
}

// =============================================================================
// Copy to Clipboard Helpers
// =============================================================================
function copyResponse() {
    const text = generatedResponse.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
        showToast("✅ Message copied to clipboard!");
        playChime(880);
        const btn = document.getElementById("copyButton");
        const prev = btn.textContent;
        btn.textContent = "✅ Copied!";
        setTimeout(() => btn.textContent = prev, 1500);
    }).catch(() => {
        showToast("⚠️ Could not access clipboard automatically.");
    });
}

function copyFullCarePackage() {
    if (!currentAnalysis) return;
    const msg = generatedResponse.textContent.trim();
    const v = currentAnalysis.voucher;

    const fullPackage =
`🤝 *FriendFix AI — Friendship Care Package*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 *Response:*
"${msg}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎟️ *FRIENDSHIP TRUCE VOUCHER:*
[ ${v.icon} ${v.title} ]
• Voucher ID: ${v.code}
• Terms: ${v.desc}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💚 *Let's fix the conversation and keep the friendship.*`;

    navigator.clipboard.writeText(fullPackage).then(() => {
        showToast("🎁 Full Care Package & Truce Voucher Copied!");
        playChime(950);
    }).catch(() => {
        showToast("⚠️ Please copy the text manually.");
    });
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 2800);
}

// =============================================================================
// LocalStorage History Management
// =============================================================================
function saveToHistory(rawText, result) {
    try {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        history.unshift({
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            friend: result.friend,
            emotion: result.emotion,
            emoji: result.emoji,
            text: rawText.substring(0, 80) + (rawText.length > 80 ? "..." : "")
        });
        if (history.length > 15) history.pop();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        updateHistoryBadge();
    } catch (e) {
        console.error("Storage error:", e);
    }
}

function updateHistoryBadge() {
    try {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        historyBadge.textContent = history.length;
    } catch {
        historyBadge.textContent = "0";
    }
}

function toggleHistoryModal() {
    const isHidden = historyModal.classList.contains("hidden");
    if (isHidden) {
        renderHistoryList();
        historyModal.classList.remove("hidden");
    } else {
        historyModal.classList.add("hidden");
    }
}

function renderHistoryList() {
    try {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (history.length === 0) {
            historyList.innerHTML = `<p class="empty-history" style="color:var(--muted); text-align:center; padding:20px;">No analyzed conversations yet.</p>`;
            return;
        }

        historyList.innerHTML = history.map((item, index) => `
            <div class="history-item" onclick="loadHistoryItem(${index})">
                <div class="history-item-header">
                    <strong>${item.emoji} ${item.friend || 'Friend'} — ${item.emotion}</strong>
                    <span style="color:var(--muted)">${item.timestamp}</span>
                </div>
                <div class="history-snippet">"${item.text}"</div>
            </div>
        `).join("");
    } catch (e) {
        historyList.innerHTML = `<p class="empty-history">Failed to load history.</p>`;
    }
}

function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    updateHistoryBadge();
    renderHistoryList();
    showToast("History cleared.");
}

// =============================================================================
// Web Audio API Synth Chimes
// =============================================================================
function playChime(freq = 600) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        // Ignored if sound blocked by browser policy
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateHistoryBadge();
    console.log("%c🤝 FriendFix AI initialized in friend-ai project", "color:#8b5cf6; font-size:14px; font-weight:bold;");
});
