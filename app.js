async function handleAuth(type) {
    const name = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');

    const url = type === 'register' ? '/api/auth/register' : '/api/auth/login';
    const bodyData = type === 'register' ? { name, email, password } : { email, password };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('auth-box').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            
            document.getElementById('user-balance').innerText = `${data.user ? data.user.balance : '0.00'} BDT`;
            loadCryptoRate();
        } else {
            msg.innerText = data.error;
        }
    } catch (err) {
        msg.innerText = "সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!";
    }
}

async function loadCryptoRate() {
    try {
        const res = await fetch('https://coingecko.com');
        const data = await res.json();
        const bdtRate = data.tether.bdt;
        document.getElementById('usdt-rate').innerText = `1 USDT ≈ ${bdtRate} BDT`;
    } catch (error) {
        document.getElementById('usdt-rate').innerText = `1 USDT ≈ 121.50 BDT (Cached)`;
    }
}
