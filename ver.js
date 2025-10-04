document.getElementById("verificationForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  // collect code
  const digits = Array.from(document.querySelectorAll(".code-inputs input"))
                      .map(input => input.value)
                      .join("");

  if (digits.length !== 6) {
    alert("Please enter the full 6-digit code.");
    return;
  }

  const email = localStorage.getItem('verifyEmail');
  if (!email) {
    alert("No email found. Please register again.");
    window.location.href = "member.html";
    return;
  }

  try {
    const res = await fetch('/api/member/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: digits })
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : "Verification failed";
      return alert("❌ " + msg);
    }

    alert("✅ Code Verified Successfully! 🎉");
    localStorage.removeItem('verifyEmail');
    // redirect to member login
    window.location.href = "member.html";
  } catch (err) {
    console.error(err);
    alert("❌ Network/server error during verification");
  }
});

// auto-focus to next input
document.querySelectorAll(".code-inputs input").forEach((input, idx, arr) => {
  input.addEventListener("input", () => {
    if (input.value && idx < arr.length - 1) {
      arr[idx + 1].focus();
    }
  });
});

document.getElementById("resendCode").addEventListener("click", async (e) => {
  e.preventDefault();
  
  const email = localStorage.getItem('verifyEmail');
  if (!email) {
    alert("No email found. Please register again.");
    window.location.href = "member.html";
    return;
  }

  try {
    const res = await fetch('/api/member/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : "Failed to resend code";
      return alert("❌ " + msg);
    }

    alert("✅ A new verification code has been sent to your email.");
  } catch (err) {
    console.error(err);
    alert("❌ Network/server error while resending code");
  }
});
