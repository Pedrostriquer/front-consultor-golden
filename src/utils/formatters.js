const formatters = {
  formatPhoneNumberForWhatsapp: (phone, country = "BR") => {
    if (!phone || typeof phone !== "string" || phone.trim() === "") {
      return { error: true, message: "Número de telefone não fornecido." };
    }

    let cleaned = phone.replace(/\D/g, "");

    if (country.trim().toLowerCase() === "br" || country.trim().toLowerCase() === "brasil") {
      if (cleaned.startsWith("55")) {
        cleaned = cleaned.substring(2);
      }

      if (cleaned.length < 10) {
        return { error: true, message: "Número inválido. Forneça o DDD." };
      }

      const ddd = cleaned.substring(0, 2);
      let numberPart = cleaned.substring(2);

      if (
        numberPart.length === 8 &&
        ["6", "7", "8", "9"].includes(numberPart[0])
      ) {
        numberPart = "9" + numberPart;
      }

      const finalNumber = `55${ddd}${numberPart}`;

      if (finalNumber.length !== 13) {
        return {
          error: true,
          message: "Formato de número brasileiro inválido.",
        };
      }

      return { error: false, link: `https://wa.me/${finalNumber}` };
    }

    return { error: false, link: `https://wa.me/${cleaned}` };
  },
};

export default formatters;