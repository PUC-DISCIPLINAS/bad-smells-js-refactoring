// Constantes para "Magic Numbers" e "Magic Strings"
const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};

const REPORT_TYPES = {
  CSV: "CSV",
  HTML: "HTML",
};

const USER_VALUE_LIMIT = 500;
const ADMIN_PRIORITY_THRESHOLD = 1000;

/**
 * Versão refatorada do ReportGenerator.
 * * Aplicamos as técnicas:
 * 1. Replace Magic Number with Symbolic Constant (ex: ROLES, USER_VALUE_LIMIT)
 * 2. Extract Method (ex: _getVisibleItems, _calculateTotal, _generateHeader, etc.)
 * * O resultado é um método generateReport limpo e uma classe onde cada
 * método tem uma responsabilidade única (SRP).
 */
export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Método principal, agora limpo e atuando como orquestrador.
   */
  generateReport(reportType, user, items) {
    // 1. Lógica de Negócio: Determinar o que deve ser visto
    const visibleItems = this._getVisibleItems(user, items);

    // 2. Lógica de Cálculo: Calcular o total *apenas* dos itens visíveis
    const total = this._calculateTotal(visibleItems);

    // 3. Lógica de Formatação: Montar a string de saída
    let report = "";
    report += this._generateHeader(reportType, user);
    report += this._generateBody(reportType, visibleItems, user);
    report += this._generateFooter(reportType, total);

    return report.trim();
  }

  // --- MÉTODOS PRIVADOS (LÓGICA DE NEGÓCIO) ---

  /**
   * Extraído da lógica de filtragem.
   * Retorna os itens que o usuário pode ver, aplicando regras de prioridade.
   */
  _getVisibleItems(user, items) {
    if (user.role === ROLES.ADMIN) {
      // Admin vê tudo, mas aplicamos a flag de prioridade
      return items.map((item) => {
        if (item.value > ADMIN_PRIORITY_THRESHOLD) {
          // Retorna uma CÓPIA do item com a flag, para não modificar o dado original
          return { ...item, priority: true };
        }
        return item;
      });
    }

    if (user.role === ROLES.USER) {
      // User comum só vê itens abaixo do limite
      return items.filter((item) => item.value <= USER_VALUE_LIMIT);
    }

    return []; // Por padrão, não mostra nada se o role for desconhecido
  }

  /**
   * Extraído do cálculo de total.
   * Evita duplicação de `total += item.value`.
   */
  _calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }

  // --- MÉTODOS PRIVADOS (LÓGICA DE FORMATAÇÃO) ---

  /**
   * Gera o cabeçalho do relatório.
   */
  _generateHeader(reportType, user) {
    if (reportType === REPORT_TYPES.CSV) {
      return "ID,NOME,VALOR,USUARIO\n";
    }
    if (reportType === REPORT_TYPES.HTML) {
      return (
        "<html><body>\n" +
        "<h1>Relatório</h1>\n" +
        `<h2>Usuário: ${user.name}</h2>\n` +
        "<table>\n" +
        "<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n"
      );
    }
    return "";
  }

  /**
   * Gera o corpo (linhas de dados) do relatório.
   */
  _generateBody(reportType, visibleItems, user) {
    let body = "";
    for (const item of visibleItems) {
      body += this._generateRow(reportType, item, user);
    }
    return body;
  }

  /**
   * Gera uma única linha do relatório.
   */
  _generateRow(reportType, item, user) {
    if (reportType === REPORT_TYPES.CSV) {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }
    if (reportType === REPORT_TYPES.HTML) {
      const style = item.priority ? 'style="font-weight:bold;"' : "";
      return `<tr ${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }
    return "";
  }

  /**
   * Gera o rodapé do relatório.
   */
  _generateFooter(reportType, total) {
    if (reportType === REPORT_TYPES.CSV) {
      return `\nTotal,,\n${total},,\n`;
    }
    if (reportType === REPORT_TYPES.HTML) {
      return "</table>\n" + `<h3>Total: ${total}</h3>\n` + "</body></html>\n";
    }
    return "";
  }
}
