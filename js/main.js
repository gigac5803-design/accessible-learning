const $ = id => document.getElementById(id);

function save(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch {
        return false;
    }
}

function load(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function error(id, message = "") {
    if ($(id)) $(id).textContent = message;
}

function emailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordValid(password) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password);
}

// LEARNING RESOURCES

let resources = load("learningResources");
let editingId = null;

function renderResources() {
    const list = $("resource-list");
    if (!list) return;

    list.replaceChildren();

    const search = ($("resource-search")?.value || "").toLowerCase();
    const category = $("resource-filter")?.value || "";

    resources
        .filter(r =>
            (r.title + " " + r.description).toLowerCase().includes(search) &&
            (!category || r.category === category)
        )
        .forEach(r => {
            const card = document.createElement("article");
            const title = document.createElement("h3");
            const description = document.createElement("p");
            const details = document.createElement("p");
            const edit = document.createElement("button");
            const remove = document.createElement("button");

            title.textContent = r.title;
            description.textContent = r.description;
            details.textContent =
                `${r.category} · ${r.format} · Rating: ${r.rating}/5`;

            edit.textContent = "Edit";
            remove.textContent = "Delete";
            edit.type = remove.type = "button";

            edit.onclick = () => {
                $("resource-title").value = r.title;
                $("resource-category").value = r.category;
                $("resource-format").value = r.format;
                $("resource-rating").value = r.rating;
                $("resource-description").value = r.description;
                editingId = r.id;
                $("resource-title").focus();
            };

            remove.onclick = () => {
                resources = resources.filter(item => item.id !== r.id);
                if (save("learningResources", resources)) renderResources();
                else alert("Could not save changes.");
            };

            card.className = "card";
            card.append(title, description, details, edit, remove);
            list.append(card);
        });
}

if ($("resource-form")) {
    $("resource-form").addEventListener("submit", e => {
        e.preventDefault();

        const resource = {
            id: editingId || Date.now().toString(),
            title: $("resource-title").value.trim(),
            category: $("resource-category").value,
            format: $("resource-format").value,
            rating: $("resource-rating").value,
            description: $("resource-description").value.trim()
        };

        if (!resource.title || !resource.description) {
            alert("Please fill in all required fields.");
            return;
        }

        const oldResources = [...resources];

        if (editingId) {
            resources = resources.map(r =>
                r.id === editingId ? resource : r
            );
        } else {
            resources.push(resource);
        }

        if (!save("learningResources", resources)) {
            resources = oldResources;
            alert("Could not save the resource.");
            return;
        }

        editingId = null;
        e.target.reset();
        renderResources();
    });
}

$("resource-search")?.addEventListener("input", renderResources);
$("resource-filter")?.addEventListener("change", renderResources);
renderResources();

// CONTACT FORM

$("contact-form")?.addEventListener("submit", e => {
    e.preventDefault();

    const name = $("contact-name").value.trim();
    const email = $("contact-email").value.trim();
    const message = $("contact-message").value.trim();

    if (!name || !emailValid(email) || !message) {
        $("contact-status").textContent =
            "Please enter your name, a valid email and a message.";
        return;
    }

    $("contact-status").textContent =
        "Thank you! This demo does not send real emails.";
    e.target.reset();
});

// AI ASSISTANT DEMO

$("ai-form")?.addEventListener("submit", e => {
    e.preventDefault();

    const text = $("ai-text").value.trim();
    const task = $("ai-task").value;
    let result = text;

    if (!text) {
        $("ai-status").textContent = "Please enter some text.";
        return;
    }

    if (task === "summary") {
        result = text.split(/[.!?]+/).filter(Boolean).slice(0, 2).join(". ");
    } else if (task === "simplify") {
        result = text
            .replace(/utilize/gi, "use")
            .replace(/approximately/gi, "about")
            .replace(/demonstrate/gi, "show")
            .replace(/require/gi, "need");
    }

    $("ai-result").textContent = result;
    $("ai-status").textContent =
        "Demo result. A real AI service is not connected.";
});

// PASSWORD HASHING FOR THE DEMO

async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(password);
    const key = await crypto.subtle.importKey(
        "raw", data, "PBKDF2", false, ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: "SHA-256"
    }, key, 256);

    return Array.from(new Uint8Array(bits))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// REGISTRATION

$("register-form")?.addEventListener("submit", async e => {
    e.preventDefault();

    const name = $("register-name").value.trim();
    const email = $("register-email").value.trim().toLowerCase();
    const birthday = $("register-birthday").value;
    const password = $("register-password").value;
    const confirm = $("register-confirm").value;
    const preference = $("learning-preference").value;
    const consent = $("register-consent").checked;

    const fields = [
        "name-error", "email-error", "birthday-error",
        "password-error", "confirm-error",
        "preference-error", "consent-error"
    ];
    fields.forEach(id => error(id));

    let valid = true;
    const age = birthday
        ? (new Date().getFullYear() - new Date(birthday).getFullYear()
            - (new Date() < new Date(
                new Date(birthday).setFullYear(new Date().getFullYear())
            ) ? 1 : 0))
        : 0;

    if (!name) {
        error("name-error", "Enter your name.");
        valid = false;
    }
    if (!emailValid(email)) {
        error("email-error", "Enter a valid email.");
        valid = false;
    }
    if (!birthday || age < 13 || new Date(birthday) >= new Date()) {
        error("birthday-error", "You must be at least 13 years old.");
        valid = false;
    }
    if (!passwordValid(password)) {
        error("password-error",
            "Use 8+ characters, uppercase, lowercase and a number.");
        valid = false;
    }
    if (password !== confirm) {
        error("confirm-error", "Passwords do not match.");
        valid = false;
    }
    if (!preference) {
        error("preference-error", "Choose a learning preference.");
        valid = false;
    }
    if (!consent) {
        error("consent-error", "Please accept the terms.");
        valid = false;
    }

    if (!valid) return;

    try {
        const accounts = load("learningAccounts");

        if (accounts.some(a => a.email === email)) {
            error("email-error", "This email is already registered.");
            return;
        }

        const salt = crypto.randomUUID();
        const passwordHash = await hashPassword(password, salt);

        accounts.push({
            id: crypto.randomUUID(),
            name, email, birthday, preference, salt, passwordHash
        });

        if (!save("learningAccounts", accounts)) {
            throw new Error("Storage unavailable");
        }

        sessionStorage.setItem("loggedInEmail", email);
        window.location.href = "index.html";
    } catch {
        $("register-status").textContent =
            "Registration failed. Try using the site with Live Server.";
    }
});

// LOGIN

$("login-form")?.addEventListener("submit", async e => {
    e.preventDefault();

    const email = $("login-email").value.trim().toLowerCase();
    const password = $("login-password").value;

    error("login-email-error");
    error("login-password-error");

    if (!emailValid(email)) {
        error("login-email-error", "Enter a valid email.");
        return;
    }
    if (!password) {
        error("login-password-error", "Enter your password.");
        return;
    }

    try {
        const account = load("learningAccounts")
            .find(a => a.email === email);

        if (!account ||
            await hashPassword(password, account.salt) !== account.passwordHash) {
            $("login-status").textContent =
                "Incorrect email or password.";
            return;
        }

        sessionStorage.setItem("loggedInEmail", email);
        window.location.href = "index.html";
    } catch {
        $("login-status").textContent =
            "Login failed. Please try again.";
    }
}
);

/* PROFILE MENU */

const profileButton = $("profile-button");
const profileMenu = $("profile-menu");

profileButton?.addEventListener("click", () => {
    if (!profileMenu) return;

    profileMenu.hidden = !profileMenu.hidden;

    profileButton.setAttribute(
        "aria-expanded",
        String(!profileMenu.hidden)
    );
});

document.addEventListener("click", e => {
    if (!profileButton || !profileMenu) return;

    if (
        !profileButton.contains(e.target) &&
        !profileMenu.contains(e.target)
    ) {
        profileMenu.hidden = true;
        profileButton.setAttribute("aria-expanded", "false");
    }
});

/* PROFILE INFORMATION */

/* PROFILE INFORMATION */

function updateProfileMenu() {
    const profileInfo = $("profile-info");
    const profileMenu = $("profile-menu");

    if (!profileInfo || !profileMenu) return;

    const email = sessionStorage.getItem("loggedInEmail");
    const accounts = load("learningAccounts");
    const account = accounts.find(a => a.email === email);

    if (!account) return;

    profileInfo.replaceChildren();

    const title = document.createElement("strong");
    title.textContent = `Hello, ${account.name}!`;

    const emailText = document.createElement("p");
    emailText.textContent = account.email;

    profileInfo.append(title, emailText);

    profileMenu.querySelectorAll(":scope > a").forEach(link => {
        if (
            link.href.includes("register.html") ||
            link.href.includes("login.html")
        ) {
            link.remove();
        }
    });

    let profileLink = profileMenu.querySelector(".profile-page-link");

    if (!profileLink) {
        profileLink = document.createElement("a");
        profileLink.className = "profile-page-link";
        profileLink.href = "profile.html";
        profileLink.textContent = "My profile";
        profileMenu.append(profileLink);
    }
}

updateProfileMenu();
