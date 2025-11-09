// src/ReportGenerator.refactored.js
// Refatoração focada em: extração de métodos, remoção de duplicação,
// redução de complexidade cognitiva e eliminação de efeitos colaterais.
// Mantém a API/contrato original e a saída textual dos relatórios.

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const safeItems = Array.isArray(items) ? items : [];

    const header = this.#renderHeader(reportType, user);
    const { body, total } = this.#renderBody(reportType, user, safeItems);
    const footer = this.#renderFooter(reportType, total);

    const report = `${header}${body}${footer}`;
    return report.trim();
  }

  #isAdmin(user) {
    return user?.role === "ADMIN";
  }

  #isStandardUser(user) {
    return user?.role === "USER";
  }

  #shouldIncludeForUser(user, item) {
    if (this.#isAdmin(user)) return true;
    if (this.#isStandardUser(user)) return item?.value <= 500;
    return false;
  }

  #isPriority(item) {
    return item?.value > 1000;
  }

  #renderHeader(reportType, user) {
    if (reportType === "CSV") {
      return "ID,NOME,VALOR,USUARIO\n";
    }
    if (reportType === "HTML") {
      return [
        "<html><body>\n",
        "<h1>Relatório</h1>\n",
        `<h2>Usuário: ${user?.name ?? ""}</h2>\n`,
        "<table>\n",
        "<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n",
      ].join("");
    }
    return "";
  }

  #renderBody(reportType, user, items) {
    let body = "";
    let total = 0;

    for (const item of items) {
      if (!this.#shouldIncludeForUser(user, item)) continue;

      const line = this.#renderRow(reportType, item, user);
      body += line;
      total += Number(item?.value || 0);
    }

    return { body, total };
  }

  #renderRow(reportType, item, user) {
    if (reportType === "CSV") {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }
    if (reportType === "HTML") {
      const style =
        this.#isAdmin(user) && this.#isPriority(item)
          ? ' style="font-weight:bold;"'
          : "";
      return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }
    return "";
  }

  #renderFooter(reportType, total) {
    if (reportType === "CSV") {
      return `\nTotal,,\n${total},,\n`;
    }
    if (reportType === "HTML") {
      return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
    }
    return "";
  }
}
