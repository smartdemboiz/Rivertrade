import { validateMnemonic, wordlists } from 'bip39';

const BIP39_WORDS = new Set(wordlists.english);

export function isValidBip39Word(word) {
  return typeof word === 'string' && BIP39_WORDS.has(word.trim().toLowerCase());
}

export function isValidBip39Phrase(phrase) {
  return typeof phrase === 'string' && validateMnemonic(phrase.trim().toLowerCase());
}
