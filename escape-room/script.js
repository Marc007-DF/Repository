(function() {
  "use strict";

  /**
   * Estado do jogo.
   */
  const state = {
    hasDrawerKey: false,
    drawerOpened: false,
    hasNoteClue: false,
    safeRevealed: false,
    safeUnlocked: false,
    hasDoorKey: false,
    doorUnlocked: false
  };

  /**
   * Elementos da UI.
   */
  const el = {
    room: document.querySelector(".room"),
    inventoryList: document.getElementById("inventory-list"),
    hint: document.getElementById("hint"),
    modal: document.getElementById("modal"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalClose: document.getElementById("modal-close"),
    btnReset: document.getElementById("btn-reset"),
    btnPorta: document.getElementById("btn-porta"),
    btnQuadro: document.getElementById("btn-quadro"),
    btnRelogio: document.getElementById("btn-relogio"),
    btnPlanta: document.getElementById("btn-planta"),
    btnGaveta: document.getElementById("btn-gaveta")
  };

  function resetGame() {
    state.hasDrawerKey = false;
    state.drawerOpened = false;
    state.hasNoteClue = false;
    state.safeRevealed = false;
    state.safeUnlocked = false;
    state.hasDoorKey = false;
    state.doorUnlocked = false;
    updateUI();
  }

  function updateUI() {
    el.inventoryList.innerHTML = "";

    if (state.hasDrawerKey) addInventoryItem("Chave pequena (gaveta)");
    if (state.hasNoteClue) addInventoryItem("Bilhete com dica");
    if (state.safeUnlocked) addInventoryItem("Chave da porta");

    el.room.classList.toggle("revealed-safe", state.safeRevealed);
    el.room.classList.toggle("safe-unlocked", state.safeUnlocked);
  }

  function addInventoryItem(label) {
    const li = document.createElement("li");
    li.textContent = label;
    el.inventoryList.appendChild(li);
  }

  function openModal(title, html) {
    el.modalTitle.textContent = title;
    el.modalBody.innerHTML = html;
    el.modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    el.modal.setAttribute("aria-hidden", "true");
    el.modalBody.innerHTML = "";
  }

  function handlePlanta() {
    if (!state.hasDrawerKey) {
      openModal(
        "Planta",
        `<p>Vasculhando a terra do vaso, você encontra algo brilhando.</p>
         <div class="actions">
           <button class="ui" id="take-key">Pegar chave</button>
           <button class="ui" data-close>Fechar</button>
         </div>`
      );
      document.getElementById("take-key").addEventListener("click", () => {
        state.hasDrawerKey = true;
        updateUI();
        openModal("Chave obtida", `<p>Você pegou uma <strong>chave pequena</strong>. Parece de gaveta.</p><div class=\"actions\"><button class=\"ui\" data-close>Ok</button></div>`);
      });
    } else {
      openModal("Planta", `<p>Somente terra úmida e folhas.</p><div class=\"actions\"><button class=\"ui\" data-close>Fechar</button></div>`);
    }
  }

  function handleGaveta() {
    if (!state.drawerOpened) {
      if (!state.hasDrawerKey) {
        openModal("Gaveta trancada", `<p>A gaveta não abre. Falta uma chave.</p><div class=\"actions\"><button class=\"ui\" data-close>Ok</button></div>`);
        return;
      }
      openModal(
        "Abrir gaveta",
        `<p>Você usa a <strong>chave pequena</strong> e destranca a gaveta.</p>
         <div class="actions">
           <button class="ui" id="open-drawer">Abrir</button>
           <button class="ui" data-close>Cancelar</button>
         </div>`
      );
      document.getElementById("open-drawer").addEventListener("click", () => {
        state.drawerOpened = true;
        state.hasNoteClue = true;
        updateUI();
        openModal(
          "Dentro da gaveta",
          `<p>Há um <strong>bilhete</strong> com a seguinte dica:</p>
           <blockquote style="margin:8px 0;padding:8px;border-left:3px solid #4b5563;color:#d1d5db;background:#0e1318;border-radius:6px;">
             "O código do cofre é a <strong>hora do relógio</strong>, sem os dois pontos."
           </blockquote>
           <div class="actions">
             <button class="ui" data-close>Entendi</button>
           </div>`
        );
      });
    } else {
      openModal("Gaveta", `<p>A gaveta está vazia agora.</p><div class=\"actions\"><button class=\"ui\" data-close>Fechar</button></div>`);
    }
  }

  function handleRelogio() {
    openModal(
      "Relógio",
      `<p>O relógio marca <strong>03:15</strong>.</p>
       <p>Talvez isso signifique algo…</p>
       <div class="actions"><button class="ui" data-close>Fechar</button></div>`
    );
  }

  function handleQuadro() {
    if (!state.safeRevealed) {
      state.safeRevealed = true;
      updateUI();
      openModal(
        "Quadro removido",
        `<p>Ao retirar o quadro, você revela um <strong>cofre</strong> embutido na parede.</p>
         <div class="actions">
           <button class="ui" id="open-safe">Abrir cofre</button>
           <button class="ui" data-close>Fechar</button>
         </div>`
      );
      document.getElementById("open-safe").addEventListener("click", openSafeModal);
      return;
    }

    if (!state.safeUnlocked) {
      openSafeModal();
      return;
    }

    if (!state.hasDoorKey) {
      openModal(
        "Cofre aberto",
        `<p>Dentro do cofre há uma <strong>chave da porta</strong>.</p>
         <div class="actions">
           <button class="ui" id="take-door-key">Pegar chave</button>
           <button class="ui" data-close>Fechar</button>
         </div>`
      );
      document.getElementById("take-door-key").addEventListener("click", () => {
        state.hasDoorKey = true;
        updateUI();
        openModal("Chave obtida", `<p>Você pegou a <strong>chave da porta</strong>.</p><div class=\"actions\"><button class=\"ui\" data-close>Ok</button></div>`);
      });
      return;
    }

    openModal("Cofre", `<p>O cofre está vazio.</p><div class=\"actions\"><button class=\"ui\" data-close>Fechar</button></div>`);
  }

  function openSafeModal() {
    if (state.safeUnlocked) {
      openModal("Cofre", `<p>O cofre já está aberto.</p><div class=\"actions\"><button class=\"ui\" data-close>Fechar</button></div>`);
      return;
    }

    const noteHint = state.hasNoteClue
      ? `<p style="color:#9ca3af">Dica: use a hora do relógio sem os dois pontos.</p>`
      : "";

    openModal(
      "Cofre",
      `<p>O cofre tem um teclado numérico de 3 dígitos.</p>
       ${noteHint}
       <form id="safe-form" style="margin-top:8px;display:flex;gap:8px;align-items:center;">
         <input id="safe-code" inputmode="numeric" pattern="\\d{3}" maxlength="3" placeholder="000" class="ui" style="width:88px;text-align:center;font-weight:700;letter-spacing:2px;" />
         <button type="submit" class="ui">Destrancar</button>
       </form>
       <div class="actions"><button class="ui" data-close>Cancelar</button></div>`
    );

    const form = document.getElementById("safe-form");
    const input = document.getElementById("safe-code");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = (input.value || "").trim();
      if (code === "315") {
        state.safeUnlocked = true;
        updateUI();
        openModal("Cofre destrancado", `<p>Você ouve um clique. O cofre abriu!</p><div class=\"actions\"><button class=\"ui\" data-close>Ok</button></div>`);
      } else {
        openModal("Código incorreto", `<p>Esse não é o código.</p><div class=\"actions\"><button class=\"ui\" data-close>Tentar novamente</button></div>`);
      }
    });
  }

  function handlePorta() {
    if (!state.hasDoorKey) {
      openModal("Porta", `<p>A porta está trancada. Precisa de uma chave.</p><div class=\"actions\"><button class=\"ui\" data-close>Ok</button></div>`);
      return;
    }

    if (!state.doorUnlocked) {
      openModal(
        "Destrancar porta",
        `<p>Usar a <strong>chave da porta</strong>?</p>
         <div class="actions">
           <button class="ui" id="unlock-door">Destrancar</button>
           <button class="ui" data-close>Cancelar</button>
         </div>`
      );
      document.getElementById("unlock-door").addEventListener("click", () => {
        state.doorUnlocked = true;
        openWinModal();
      });
      return;
    }

    openWinModal();
  }

  function openWinModal() {
    openModal(
      "Você escapou!",
      `<p>Parabéns! Você encontrou a chave e escapou do estúdio.</p>
       <div class="actions">
         <button class="ui" id="play-again">Jogar novamente</button>
       </div>`
    );
    document.getElementById("play-again").addEventListener("click", () => {
      resetGame();
      closeModal();
    });
  }

  function wireEvents() {
    el.btnReset.addEventListener("click", resetGame);

    el.modal.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof HTMLElement && (target.dataset.close !== undefined || target.dataset.close === "true" || target.classList.contains("modal-backdrop"))) {
        closeModal();
      }
    });

    el.modalClose.addEventListener("click", closeModal);

    el.btnPlanta.addEventListener("click", handlePlanta);
    el.btnGaveta.addEventListener("click", handleGaveta);
    el.btnRelogio.addEventListener("click", handleRelogio);
    el.btnQuadro.addEventListener("click", handleQuadro);
    el.btnPorta.addEventListener("click", handlePorta);
  }

  wireEvents();
  updateUI();
})();