import { Country } from "../types";

// Expanded list for User Registration Dropdown
export const REGISTRATION_COUNTRIES: Country[] = [
  { name: "Afganistán", code: "af" }, { name: "Albania", code: "al" }, { name: "Alemania", code: "de" },
  { name: "Andorra", code: "ad" }, { name: "Angola", code: "ao" }, { name: "Arabia Saudita", code: "sa" },
  { name: "Argelia", code: "dz" }, { name: "Argentina", code: "ar" }, { name: "Armenia", code: "am" },
  { name: "Australia", code: "au" }, { name: "Austria", code: "at" }, { name: "Azerbaiyán", code: "az" },
  { name: "Bangladesh", code: "bd" }, { name: "Bélgica", code: "be" }, { name: "Bolivia", code: "bo" },
  { name: "Bosnia y Herzegovina", code: "ba" }, { name: "Brasil", code: "br" }, { name: "Bulgaria", code: "bg" },
  { name: "Camerún", code: "cm" }, { name: "Canadá", code: "ca" }, { name: "Chile", code: "cl" },
  { name: "China", code: "cn" }, { name: "Colombia", code: "co" }, { name: "Corea del Sur", code: "kr" },
  { name: "Costa Rica", code: "cr" }, { name: "Croacia", code: "hr" }, { name: "Cuba", code: "cu" },
  { name: "Dinamarca", code: "dk" }, { name: "Ecuador", code: "ec" }, { name: "Egipto", code: "eg" },
  { name: "El Salvador", code: "sv" }, { name: "Emiratos Árabes", code: "ae" }, { name: "Eslovaquia", code: "sk" },
  { name: "Eslovenia", code: "si" }, { name: "España", code: "es" }, { name: "Estados Unidos", code: "us" },
  { name: "Estonia", code: "ee" }, { name: "Filipinas", code: "ph" }, { name: "Finlandia", code: "fi" },
  { name: "Francia", code: "fr" }, { name: "Ghana", code: "gh" }, { name: "Grecia", code: "gr" },
  { name: "Guatemala", code: "gt" }, { name: "Honduras", code: "hn" }, { name: "Hungría", code: "hu" },
  { name: "India", code: "in" }, { name: "Indonesia", code: "id" }, { name: "Irak", code: "iq" },
  { name: "Irán", code: "ir" }, { name: "Irlanda", code: "ie" }, { name: "Islandia", code: "is" },
  { name: "Israel", code: "il" }, { name: "Italia", code: "it" }, { name: "Jamaica", code: "jm" },
  { name: "Japón", code: "jp" }, { name: "Jordania", code: "jo" }, { name: "Kazajistán", code: "kz" },
  { name: "Kenia", code: "ke" }, { name: "Letonia", code: "lv" }, { name: "Líbano", code: "lb" },
  { name: "Lituania", code: "lt" }, { name: "Luxemburgo", code: "lu" }, { name: "Malasia", code: "my" },
  { name: "Marruecos", code: "ma" }, { name: "México", code: "mx" }, { name: "Mónaco", code: "mc" },
  { name: "Nepal", code: "np" }, { name: "Nicaragua", code: "ni" }, { name: "Nigeria", code: "ng" },
  { name: "Noruega", code: "no" }, { name: "Nueva Zelanda", code: "nz" }, { name: "Países Bajos", code: "nl" },
  { name: "Pakistán", code: "pk" }, { name: "Panamá", code: "pa" }, { name: "Paraguay", code: "py" },
  { name: "Perú", code: "pe" }, { name: "Polonia", code: "pl" }, { name: "Portugal", code: "pt" },
  { name: "Qatar", code: "qa" }, { name: "Reino Unido", code: "gb" }, { name: "República Checa", code: "cz" },
  { name: "República Dominicana", code: "do" }, { name: "Rumanía", code: "ro" }, { name: "Rusia", code: "ru" },
  { name: "Senegal", code: "sn" }, { name: "Serbia", code: "rs" }, { name: "Singapur", code: "sg" },
  { name: "Sudáfrica", code: "za" }, { name: "Suecia", code: "se" }, { name: "Suiza", code: "ch" },
  { name: "Tailandia", code: "th" }, { name: "Turquía", code: "tr" }, { name: "Ucrania", code: "ua" },
  { name: "Uruguay", code: "uy" }, { name: "Venezuela", code: "ve" }, { name: "Vietnam", code: "vn" }
];

// Filtered list: Removed microstates and less universally recognized flags for better gameplay flow
const EUROPEAN_COUNTRIES: Country[] = [
  { name: "Alemania", code: "de" },
  { name: "Austria", code: "at" },
  { name: "Bélgica", code: "be" },
  { name: "Bosnia", code: "ba" },
  { name: "Bulgaria", code: "bg" },
  { name: "Croacia", code: "hr" },
  { name: "Dinamarca", code: "dk" },
  { name: "Eslovaquia", code: "sk" },
  { name: "Eslovenia", code: "si" },
  { name: "España", code: "es" },
  { name: "Finlandia", code: "fi" },
  { name: "Francia", code: "fr" },
  { name: "Grecia", code: "gr" },
  { name: "Hungría", code: "hu" },
  { name: "Irlanda", code: "ie" },
  { name: "Islandia", code: "is" },
  { name: "Italia", code: "it" },
  { name: "Noruega", code: "no" },
  { name: "Países Bajos", code: "nl" },
  { name: "Polonia", code: "pl" },
  { name: "Portugal", code: "pt" },
  { name: "Reino Unido", code: "gb" },
  { name: "Rep. Checa", code: "cz" },
  { name: "Rumanía", code: "ro" },
  { name: "Rusia", code: "ru" },
  { name: "Serbia", code: "rs" },
  { name: "Suecia", code: "se" },
  { name: "Suiza", code: "ch" },
  { name: "Turquía", code: "tr" },
  { name: "Ucrania", code: "ua" }
];

export const fetchCountries = async (mode: 'europe' | 'world' = 'europe'): Promise<Country[]> => {
    // Return static list immediately for 0 latency
    return Promise.resolve(EUROPEAN_COUNTRIES);
};