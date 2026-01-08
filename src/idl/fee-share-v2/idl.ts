/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bags_fee_share.json`.
 */
export type BagsFeeShare = {
  "address": "FEE2tBhCKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK",
  "metadata": {
    "name": "bagsFeeShare",
    "version": "2.1.0",
    "spec": "0.1.0",
    "description": "Bags Fee Share V2 Program"
  },
  "instructions": [
    {
      "name": "claimDammV2",
      "docs": [
        "Claim DAMM v2 fees"
      ],
      "discriminator": [
        232,
        175,
        106,
        19,
        168,
        54,
        186,
        108
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer (covers any runtime init costs)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "feeShareConfig",
          "docs": [
            "Fee share config (PDA; seeds by base/quote mints)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthority",
          "docs": [
            "Fee ledger (PDA); signer for CPIs and fee distribution"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthorityQuoteAta",
          "docs": [
            "Authority's WSOL ATA (receives quote fees)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeShareAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feeShareAuthorityBaseAta",
          "docs": [
            "Authority's base mint ATA"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeShareAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "writable": true,
          "address": "8SrW8DjZcAPAWYSdSu468LKLQ7WDRaEUsswNvHCiAYs"
        },
        {
          "name": "platformVault",
          "docs": [
            "Platform vault (receives bags fees)"
          ],
          "writable": true,
          "address": "ERH2UUYzUULwKy7sLHxeEGcN4B2QjDoQS8Z8GMhuL8cE"
        },
        {
          "name": "partnerConfig",
          "docs": [
            "Optional partner config (PDA) used to compute/transfer partner share"
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "partner"
              }
            ]
          }
        },
        {
          "name": "partner",
          "docs": [
            "Optional partner wallet (seed and key validation)"
          ],
          "optional": true
        },
        {
          "name": "partnerConfigQuoteAta",
          "docs": [
            "Optional partner's WSOL ATA (destination for partner share)"
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "partnerConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "baseMint",
          "docs": [
            "Base token mint (seed)"
          ]
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL; seed)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Programs"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "dammProgram",
          "docs": [
            "----------- EXTRA ACCOUNTS FOR DAMM v2 -----------"
          ],
          "address": "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"
        },
        {
          "name": "poolAuthority",
          "address": "HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC"
        },
        {
          "name": "pool"
        },
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "baseVault",
          "writable": true
        },
        {
          "name": "quoteVault",
          "writable": true
        },
        {
          "name": "positionNftAccount"
        },
        {
          "name": "dammEventAuthority",
          "address": "3rmHSu74h1ZcmAisVcWerTCiRDQbUrBKmcwptYGjHfet"
        },
        {
          "name": "tokenBaseProgram",
          "docs": [
            "SPL Token programs for both legs"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenQuoteProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "claimDbc",
      "docs": [
        "Claim DBC fees"
      ],
      "discriminator": [
        229,
        142,
        38,
        65,
        198,
        50,
        110,
        58
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer funding any init_if_needed ATAs"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "feeShareConfig",
          "docs": [
            "Fee share config (PDA; seeds by base/quote mints)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthority",
          "docs": [
            "Fee ledger (PDA); signer for CPIs and fee distribution"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthorityQuoteAta",
          "docs": [
            "Authority's WSOL ATA (receives quote fees)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeShareAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feeShareAuthorityBaseAta",
          "docs": [
            "Authority's base mint ATA (DBC CPI interface)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeShareAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "partnerConfig",
          "docs": [
            "Optional partner config (PDA) used to compute/transfer partner share"
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "partner"
              }
            ]
          }
        },
        {
          "name": "partner",
          "docs": [
            "Optional partner wallet (seed and key validation)"
          ],
          "optional": true
        },
        {
          "name": "partnerConfigQuoteAta",
          "docs": [
            "Optional partner's WSOL ATA (destination for partner share)"
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "partnerConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "writable": true,
          "address": "8SrW8DjZcAPAWYSdSu468LKLQ7WDRaEUsswNvHCiAYs"
        },
        {
          "name": "platformVault",
          "docs": [
            "Platform vault (receives bags fees)"
          ],
          "writable": true,
          "address": "ERH2UUYzUULwKy7sLHxeEGcN4B2QjDoQS8Z8GMhuL8cE"
        },
        {
          "name": "baseMint",
          "docs": [
            "Base token mint (seed)"
          ]
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL; seed)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Programs"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "dbcProgram",
          "address": "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"
        },
        {
          "name": "poolAuthority",
          "docs": [
            "----------- EXTRA ACCOUNTS FOR METEORA -----------"
          ],
          "address": "FhVo3mqL8PW5pH5U2CN4XE33DokiyZnUwuGpH2hmHLuM"
        },
        {
          "name": "config"
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "baseVault",
          "writable": true
        },
        {
          "name": "quoteVault",
          "writable": true
        },
        {
          "name": "dbcEventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                9,
                96,
                12,
                165,
                36,
                247,
                177,
                183,
                214,
                204,
                177,
                195,
                151,
                58,
                160,
                51,
                13,
                25,
                3,
                218,
                96,
                28,
                201,
                181,
                222,
                227,
                198,
                98,
                180,
                202,
                209,
                73
              ]
            }
          }
        },
        {
          "name": "tokenBaseProgram",
          "docs": [
            "SPL Token programs for both legs (DBC interface)"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenQuoteProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "claimPartner",
      "docs": [
        "Claim partner fees"
      ],
      "discriminator": [
        181,
        78,
        148,
        221,
        100,
        54,
        21,
        114
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer funding init_if_needed of partner's ATA"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "partner",
          "docs": [
            "Partner signer receiving funds"
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "partnerConfig"
          ]
        },
        {
          "name": "partnerConfig",
          "docs": [
            "Partner config (PDA), also PDA authority for its ATA"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "partner"
              }
            ]
          }
        },
        {
          "name": "partnerQuoteAta",
          "docs": [
            "Partner's WSOL ATA (destination; init-if-needed)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "partner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "partnerConfigQuoteAta",
          "docs": [
            "PartnerConfig's WSOL ATA (source; PDA-owned)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "partnerConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "claimPlatformFees",
      "docs": [
        "Claim platform fees to the receiver"
      ],
      "discriminator": [
        159,
        129,
        37,
        35,
        170,
        99,
        163,
        16
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin signer authorizing the claim"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "receiver",
          "docs": [
            "Receiver of the platform fees (could be admin itself)"
          ]
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "platformVault",
          "docs": [
            "Platform vault (receives bags fees)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "programConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "receiverQuoteAta",
          "docs": [
            "Receiver's WSOL ATA (destination; init-if-needed)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "receiver"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "claimUser",
      "docs": [
        "Claim user fees"
      ],
      "discriminator": [
        164,
        64,
        55,
        199,
        90,
        78,
        147,
        188
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer funding init_if_needed of user's ATA"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "docs": [
            "The claiming user; must match `claimers[idx]`"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "feeShareConfig",
          "docs": [
            "Fee share config (PDA; seeds by base/quote mints)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthority",
          "docs": [
            "Fee ledger (PDA; source of funds)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthorityQuoteAta",
          "docs": [
            "Authority's WSOL ATA (source)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeShareAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userQuoteAta",
          "docs": [
            "User's WSOL ATA (destination; init-if-needed)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "baseMint",
          "docs": [
            "Base token mint (seed)"
          ]
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL; seed)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "claimUserParameters"
            }
          }
        }
      ]
    },
    {
      "name": "confirmAdmin",
      "docs": [
        "Pending admin confirms and becomes the admin"
      ],
      "discriminator": [
        18,
        211,
        32,
        168,
        193,
        120,
        133,
        115
      ],
      "accounts": [
        {
          "name": "pendingAdmin",
          "docs": [
            "Pending admin must sign to accept"
          ],
          "signer": true
        },
        {
          "name": "programConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "createFeeConfig",
      "docs": [
        "Create fee config"
      ],
      "discriminator": [
        214,
        172,
        105,
        64,
        8,
        228,
        209,
        204
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer funding account creations and ATAs"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "docs": [
            "Admin signer authorizing creation"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeShareConfig",
          "docs": [
            "Initialize fee share config (PDA) with claimers/BPS"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthority",
          "docs": [
            "Initialize fee ledger (PDA) sized to number of claimers"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthorityQuoteAta",
          "docs": [
            "Authority's WSOL ATA (init-if-needed)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeShareAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "partnerConfig",
          "docs": [
            "Optional partner config (PDA) for partner share"
          ],
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "partner"
              }
            ]
          }
        },
        {
          "name": "partner",
          "docs": [
            "Optional partner wallet used in seeds/header"
          ],
          "optional": true
        },
        {
          "name": "baseMint"
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL; seed)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createFeeConfigParameters"
            }
          }
        }
      ]
    },
    {
      "name": "createPartnerConfig",
      "docs": [
        "Create partner config"
      ],
      "discriminator": [
        208,
        0,
        245,
        161,
        220,
        128,
        138,
        153
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer funding account creations and ATAs"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "docs": [
            "Admin signer authorizing creation"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "partnerConfig",
          "docs": [
            "Initialize partner config (PDA) for the given partner"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "partner"
              }
            ]
          }
        },
        {
          "name": "partnerConfigQuoteAta",
          "docs": [
            "PartnerConfig's WSOL ATA (receives partner share)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "partnerConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "partner",
          "docs": [
            "Partner wallet associated with the config"
          ]
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createPartnerConfigParameters"
            }
          }
        }
      ]
    },
    {
      "name": "dummy1",
      "docs": [
        "Dummy function to be used for IDL generation",
        "",
        "DO NOT CALL THIS FUNCTION"
      ],
      "discriminator": [
        159,
        255,
        61,
        156,
        197,
        198,
        94,
        200
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": {
              "name": "feeShareConfig"
            }
          }
        }
      ]
    },
    {
      "name": "dummy2",
      "docs": [
        "Dummy function to be used for IDL generation",
        "",
        "DO NOT CALL THIS FUNCTION"
      ],
      "discriminator": [
        156,
        133,
        43,
        254,
        54,
        30,
        107,
        7
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": {
              "name": "feeShareAuthority"
            }
          }
        }
      ]
    },
    {
      "name": "extendCreatedFeeConfig",
      "docs": [
        "Extend fee config during init (append-only growth)"
      ],
      "discriminator": [
        205,
        172,
        113,
        254,
        225,
        59,
        82,
        79
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer funding reallocations during extend"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "docs": [
            "Admin signer authorizing the extend"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeShareConfig",
          "docs": [
            "Fee share config (PDA) whose claimers/BPS are extended"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthority",
          "docs": [
            "Fee ledger (PDA) whose fees array will be reallocated with zeros appended"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "partner",
          "docs": [
            "Optional partner wallet used in seeds/header"
          ],
          "optional": true
        },
        {
          "name": "partnerConfig",
          "docs": [
            "Optional partner config account; if provided must match seeds with `partner`"
          ],
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "partner"
              }
            ]
          }
        },
        {
          "name": "baseMint"
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL; seed for PDAs)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program (realloc/rent)"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "extendCreatedFeeConfigParameters"
            }
          }
        }
      ]
    },
    {
      "name": "forceClaimUser",
      "docs": [
        "Force claim user fees (admin only)"
      ],
      "discriminator": [
        216,
        217,
        173,
        83,
        118,
        151,
        252,
        48
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin signer authorizing force claim"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "docs": [
            "Claimer user (no signature required)"
          ],
          "writable": true
        },
        {
          "name": "feeShareConfig",
          "docs": [
            "Fee share config (PDA; seeds by base/quote mints)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthority",
          "docs": [
            "Fee ledger (PDA; source of funds)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthorityQuoteAta",
          "docs": [
            "Authority's WSOL ATA (source)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeShareAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userQuoteAta",
          "docs": [
            "User's WSOL ATA (destination; init-if-needed)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "baseMint",
          "docs": [
            "Base token mint (seed)"
          ]
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL; seed)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "forceClaimUserParameters"
            }
          }
        }
      ]
    },
    {
      "name": "initProgramConfig",
      "docs": [
        "Initialize the singleton ProgramConfig. Callable once."
      ],
      "discriminator": [
        185,
        54,
        237,
        229,
        219,
        179,
        109,
        20
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer funding the account creation"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "docs": [
            "Initial admin who will control the program"
          ],
          "signer": true
        },
        {
          "name": "programConfig",
          "docs": [
            "Initialize the singleton ProgramConfig PDA"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "platformVault",
          "docs": [
            "Program vault (receives bags fees)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "programConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "updateFeeConfig",
      "docs": [
        "Update fee config (claimers + bps + partner_bps)"
      ],
      "discriminator": [
        104,
        184,
        103,
        242,
        88,
        151,
        107,
        20
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin signer authorizing the update"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeShareConfig",
          "docs": [
            "Fee share config (PDA) whose claimers/BPS are updated"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "feeShareAuthority",
          "docs": [
            "Fee ledger (PDA) whose fees array may be reallocated/reordered"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ]
          }
        },
        {
          "name": "baseMint",
          "docs": [
            "Base mint (seed for PDAs)"
          ]
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote mint (WSOL; seed for PDAs)"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program (realloc/rent)"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateFeeConfigParameters"
            }
          }
        }
      ]
    },
    {
      "name": "updatePartnerConfig",
      "docs": [
        "**@deprecated: use `update_partner_fee_collection` instead (2.1.0)**"
      ],
      "discriminator": [
        111,
        77,
        242,
        174,
        244,
        48,
        138,
        213
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin signer authorizing update"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "partnerConfig",
          "docs": [
            "Partner config (PDA) to update BPS; must belong to `partner`"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "partner"
              }
            ]
          }
        },
        {
          "name": "partner",
          "docs": [
            "Partner wallet referenced by the config"
          ],
          "relations": [
            "partnerConfig"
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program (if realloc/rent needed)"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updatePartnerConfigParameters"
            }
          }
        }
      ]
    },
    {
      "name": "updatePartnerFeeCollection",
      "docs": [
        "Updates:",
        "* partner fee collection mode",
        "* partner fee collection platform bps",
        "* partner fee collection claimers bps"
      ],
      "discriminator": [
        155,
        56,
        159,
        217,
        130,
        217,
        252,
        72
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin signer authorizing update"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "programConfig",
          "docs": [
            "Singleton program config PDA (holds admin pubkey)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "partnerConfig",
          "docs": [
            "Partner config (PDA) to update; must belong to `partner`"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "partner"
              }
            ]
          }
        },
        {
          "name": "partner",
          "docs": [
            "Partner wallet referenced by the config"
          ],
          "relations": [
            "partnerConfig"
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program (future-proofing)"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updatePartnerFeeCollectionParameters"
            }
          }
        }
      ]
    },
    {
      "name": "updateProgramConfig",
      "docs": [
        "Set or clear a pending admin (two-step transfer)"
      ],
      "discriminator": [
        214,
        3,
        187,
        98,
        170,
        106,
        33,
        45
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "programConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateProgramConfigParameters"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "feeShareAuthorityHeader",
      "discriminator": [
        82,
        28,
        140,
        167,
        168,
        216,
        93,
        211
      ]
    },
    {
      "name": "feeShareConfigHeader",
      "discriminator": [
        40,
        71,
        136,
        156,
        222,
        49,
        31,
        201
      ]
    },
    {
      "name": "partnerConfig",
      "discriminator": [
        212,
        110,
        106,
        253,
        66,
        131,
        77,
        96
      ]
    },
    {
      "name": "programConfig",
      "discriminator": [
        196,
        210,
        90,
        231,
        144,
        149,
        140,
        63
      ]
    }
  ],
  "events": [
    {
      "name": "bagsFeeSharePartnerClaimEvent",
      "discriminator": [
        180,
        40,
        86,
        176,
        242,
        25,
        220,
        77
      ]
    },
    {
      "name": "bagsFeeShareProtocolClaimEvent",
      "discriminator": [
        168,
        122,
        235,
        187,
        157,
        4,
        94,
        126
      ]
    },
    {
      "name": "bagsFeeShareUserClaimEvent",
      "discriminator": [
        115,
        178,
        50,
        219,
        175,
        234,
        48,
        101
      ]
    },
    {
      "name": "feeConfigSnapshotEvent",
      "discriminator": [
        121,
        73,
        0,
        217,
        175,
        252,
        147,
        193
      ]
    },
    {
      "name": "feeConfigUpdatedEvent",
      "discriminator": [
        139,
        188,
        235,
        116,
        222,
        55,
        95,
        201
      ]
    },
    {
      "name": "partnerAccumulatedEvent",
      "discriminator": [
        114,
        92,
        185,
        185,
        201,
        162,
        75,
        240
      ]
    },
    {
      "name": "partnerConfigCreatedEvent",
      "discriminator": [
        110,
        5,
        186,
        72,
        118,
        105,
        115,
        126
      ]
    },
    {
      "name": "partnerConfigUpdatedEvent",
      "discriminator": [
        131,
        8,
        238,
        0,
        102,
        179,
        81,
        241
      ]
    },
    {
      "name": "partnerConfigV2SnapshotEvent",
      "discriminator": [
        44,
        79,
        22,
        247,
        183,
        216,
        168,
        183
      ]
    },
    {
      "name": "platformAccumulatedEvent",
      "discriminator": [
        135,
        109,
        121,
        126,
        171,
        62,
        118,
        76
      ]
    },
    {
      "name": "platformClaimedEvent",
      "discriminator": [
        147,
        166,
        33,
        185,
        161,
        49,
        207,
        139
      ]
    },
    {
      "name": "programConfigAdminUpdatedEvent",
      "discriminator": [
        19,
        215,
        161,
        37,
        149,
        193,
        142,
        93
      ]
    },
    {
      "name": "programConfigInitializedEvent",
      "discriminator": [
        210,
        169,
        156,
        90,
        13,
        171,
        254,
        140
      ]
    },
    {
      "name": "programConfigUpdatedEvent",
      "discriminator": [
        14,
        133,
        50,
        100,
        0,
        210,
        124,
        228
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "typeConversionFailed",
      "msg": "Type conversion failed"
    },
    {
      "code": 6001,
      "name": "checkedCalculationOverflow",
      "msg": "Checked Calculation overflowed"
    },
    {
      "code": 6002,
      "name": "invalidBps",
      "msg": "Invalid BPS provided, total of all should equal 10_000"
    },
    {
      "code": 6003,
      "name": "invalidPartnerBps",
      "msg": "When partner is provided, partner_bps must be gt 0 and lt 10_000"
    },
    {
      "code": 6004,
      "name": "invalidPartnerFeeCollectionMode",
      "msg": "Invalid partner fee collection mode"
    },
    {
      "code": 6005,
      "name": "invalidPartnerFeeCollectionBps",
      "msg": "Invalid partner fee collection BPS (must be < 10_000)"
    },
    {
      "code": 6006,
      "name": "missingPartnerFeeCollectionPlatformBps",
      "msg": "Missing partner platform fee collection BPS for selected mode"
    },
    {
      "code": 6007,
      "name": "invalidPlatformBps",
      "msg": "Invalid platform BPS provided, must be lt 10_000"
    },
    {
      "code": 6008,
      "name": "invalidPartnerAccounts",
      "msg": "Invalid partner accounts provided"
    },
    {
      "code": 6009,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6010,
      "name": "nothingToClaim",
      "msg": "Nothing to claim"
    },
    {
      "code": 6011,
      "name": "invalidDataLength",
      "msg": "Invalid data length"
    },
    {
      "code": 6012,
      "name": "mismatchedLengths",
      "msg": "Mismatched claimers and bps lengths"
    },
    {
      "code": 6013,
      "name": "indexOutOfBounds",
      "msg": "Index out of bounds"
    },
    {
      "code": 6014,
      "name": "onlyWsolSupported",
      "msg": "Only WSOL is supported as quote mint"
    },
    {
      "code": 6015,
      "name": "duplicateClaimer",
      "msg": "Duplicate claimer provided"
    },
    {
      "code": 6016,
      "name": "cannotRemoveClaimerWithFees",
      "msg": "Cannot remove claimer that still has outstanding fees"
    },
    {
      "code": 6017,
      "name": "cannotChangeClaimerIndexWithFees",
      "msg": "Cannot change index for claimer that still has outstanding fees"
    },
    {
      "code": 6018,
      "name": "unreachable",
      "msg": "Shouldn't happen, but fell through to here"
    },
    {
      "code": 6019,
      "name": "noPendingAdmin",
      "msg": "No pending admin"
    },
    {
      "code": 6020,
      "name": "invalidAmountOut",
      "msg": "Invalid amount out provided"
    },
    {
      "code": 6021,
      "name": "cannotSetSelfAsPendingAdmin",
      "msg": "Cannot set self as pending admin"
    },
    {
      "code": 6022,
      "name": "invalidUpdateIndex",
      "msg": "Invalid update index"
    },
    {
      "code": 6023,
      "name": "configNotInitialized",
      "msg": "Config not initialized"
    },
    {
      "code": 6024,
      "name": "configUpdateLocked",
      "msg": "Config update is currently locked"
    },
    {
      "code": 6025,
      "name": "invalidNumClaimers",
      "msg": "Invalid number of claimers, must be between 1 and MAX_CLAIMERS"
    },
    {
      "code": 6026,
      "name": "configAlreadyFinalized",
      "msg": "Config already finalized"
    },
    {
      "code": 6027,
      "name": "invalidFeeShareAuthority",
      "msg": "Invalid fee share authority provided"
    },
    {
      "code": 6028,
      "name": "updatePartnerConfigDeprecated",
      "msg": "Deprecated ix, use update_partner_fee_collection instead"
    }
  ],
  "types": [
    {
      "name": "bagsFeeSharePartnerClaimEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "partner",
            "docs": [
              "The partner who claimed"
            ],
            "type": "pubkey"
          },
          {
            "name": "partnerConfig",
            "docs": [
              "Partner config account"
            ],
            "type": "pubkey"
          },
          {
            "name": "claimed",
            "docs": [
              "Amount transferred to partner in this ix (quote token units)"
            ],
            "type": "u64"
          },
          {
            "name": "totalClaimedFees",
            "docs": [
              "Cumulative amount the partner has claimed to date (quote token units)"
            ],
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "bagsFeeShareProtocolClaimEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "payer",
            "docs": [
              "Payer account"
            ],
            "type": "pubkey"
          },
          {
            "name": "baseMint",
            "docs": [
              "Mint of the base token"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "docs": [
              "Mint of the quote token"
            ],
            "type": "pubkey"
          },
          {
            "name": "pool",
            "docs": [
              "Pool of the protocol"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeShareConfig",
            "docs": [
              "Fee share config account"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeShareAuthority",
            "docs": [
              "Fee share authority account"
            ],
            "type": "pubkey"
          },
          {
            "name": "claimers",
            "docs": [
              "Claimers list (ordered)"
            ],
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "fees",
            "docs": [
              "Per-claimer accrued amounts matching `claimers` (quote token units)"
            ],
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "protocol",
            "docs": [
              "Source protocol for this claim snapshot"
            ],
            "type": {
              "defined": {
                "name": "claimProtocol"
              }
            }
          }
        ]
      }
    },
    {
      "name": "bagsFeeShareUserClaimEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "baseMint",
            "docs": [
              "base mint"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "docs": [
              "quote mint"
            ],
            "type": "pubkey"
          },
          {
            "name": "user",
            "docs": [
              "The user who claimed"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeShareConfig",
            "docs": [
              "Fee share config account"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeShareAuthority",
            "docs": [
              "Fee share authority account"
            ],
            "type": "pubkey"
          },
          {
            "name": "claimerIndex",
            "docs": [
              "Index of the claimer within the config's claimers array"
            ],
            "type": "u32"
          },
          {
            "name": "claimed",
            "docs": [
              "Amount transferred to user (quote token units)"
            ],
            "type": "u64"
          },
          {
            "name": "isForced",
            "docs": [
              "Whether this claim was forced by an admin"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "claimProtocol",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "dbc"
          },
          {
            "name": "dammV2"
          }
        ]
      }
    },
    {
      "name": "claimUserParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claimerIndex",
            "docs": [
              "Index of claimer in the config claimers array"
            ],
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "createFeeConfigParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bps",
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "finalizeInit",
            "docs": [
              "Whether the initialization is finalized.",
              "`true`: this is the final ix and wont be able to extend later",
              "`false`: this is not the final ix and can be extended later"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "createPartnerConfigParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "extendCreatedFeeConfigParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bps",
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "finalizeInit",
            "docs": [
              "Whether the initialization is finalized by this call.",
              "`true`: finalize now and prevent further extends/updates until normal update flow",
              "`false`: allow further extends until finalization"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "feeConfigSnapshotEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "admin",
            "docs": [
              "Admin that created/updated the fee config"
            ],
            "type": "pubkey"
          },
          {
            "name": "payer",
            "docs": [
              "Payer account (creator)"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeConfig",
            "docs": [
              "Fee share config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeAuthority",
            "docs": [
              "Fee share authority account (PDA holding ledger and ATAs)"
            ],
            "type": "pubkey"
          },
          {
            "name": "baseMint",
            "docs": [
              "Base mint of the bonding curve token"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "docs": [
              "Quote mint of the bonding curve token"
            ],
            "type": "pubkey"
          },
          {
            "name": "partner",
            "docs": [
              "Optional partner wallet tied to this config"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "partnerBps",
            "docs": [
              "Partner share in basis points"
            ],
            "type": "u16"
          },
          {
            "name": "bps",
            "docs": [
              "Per-claimer shares in basis points (aligned with `claimers`)"
            ],
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "claimers",
            "docs": [
              "Ordered claimer addresses for this config"
            ],
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "feeConfigUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "admin",
            "docs": [
              "Admin that updated the fee config"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeConfig",
            "docs": [
              "Fee share config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeAuthority",
            "docs": [
              "Fee share authority account (PDA holding ledger and ATAs)"
            ],
            "type": "pubkey"
          },
          {
            "name": "baseMint",
            "docs": [
              "Base mint of the bonding curve token"
            ],
            "type": "pubkey"
          },
          {
            "name": "newBps",
            "docs": [
              "Per-claimer shares in basis points (aligned with `claimers`)"
            ],
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "newClaimers",
            "docs": [
              "Ordered claimer addresses for this config"
            ],
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "feeShareAuthority",
      "docs": [
        "Legacy serialized layout for IDL/IDL tests only. Not used at runtime."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "Fee share config public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalLifetimeAccumulatedFees",
            "docs": [
              "Cumulative fees ever accumulated from protocols into the authority ATA"
            ],
            "type": "u128"
          },
          {
            "name": "totalUserClaimedFees",
            "docs": [
              "Cumulative fees ever claimed out by users"
            ],
            "type": "u128"
          },
          {
            "name": "totalPartnerClaimedFees",
            "docs": [
              "Cumulative fees ever claimed out by partner"
            ],
            "type": "u128"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for the authority account"
            ],
            "type": "u8"
          },
          {
            "name": "padding",
            "docs": [
              "Future use"
            ],
            "type": {
              "array": [
                "u8",
                15
              ]
            }
          },
          {
            "name": "fees",
            "docs": [
              "Per-claimer accrued amounts (payload is variable-length at runtime)"
            ],
            "type": {
              "array": [
                "u64",
                1
              ]
            }
          }
        ]
      }
    },
    {
      "name": "feeShareAuthorityHeader",
      "docs": [
        "Zero-copy header for fixed fields. This is the `T` in `AccountLoader<'info, T>`."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "Fee share config public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalLifetimeAccumulatedFees",
            "docs": [
              "Cumulative fees ever accumulated from protocols into the authority ATA"
            ],
            "type": "u128"
          },
          {
            "name": "totalUserClaimedFees",
            "docs": [
              "Cumulative fees ever claimed out by users"
            ],
            "type": "u128"
          },
          {
            "name": "totalPartnerClaimedFees",
            "docs": [
              "Cumulative fees ever claimed out by partner"
            ],
            "type": "u128"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for the authority account"
            ],
            "type": "u8"
          },
          {
            "name": "padding",
            "docs": [
              "Future use"
            ],
            "type": {
              "array": [
                "u8",
                15
              ]
            }
          }
        ]
      }
    },
    {
      "name": "feeShareConfig",
      "docs": [
        "Legacy serialized layout for IDL/IDL tests only. Not used at runtime."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baseMint",
            "docs": [
              "Base mint public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "docs": [
              "Quote mint public key (currently only WSOL is supported)"
            ],
            "type": "pubkey"
          },
          {
            "name": "partner",
            "docs": [
              "Optional partner public"
            ],
            "type": "pubkey"
          },
          {
            "name": "partnerConfig",
            "docs": [
              "Optional partner config"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding0",
            "docs": [
              "Reserved for future use"
            ],
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "isInitFinalized",
            "docs": [
              "When this is `0` - it's initialization is not done yet (claim/update ixs will fail)"
            ],
            "type": "u8"
          },
          {
            "name": "isUpdateLocked",
            "docs": [
              "When this is `1` - config is locked for pending updates (claim ixs will fail)",
              "**AVOID** setting this manually, use update methods"
            ],
            "type": "u8"
          },
          {
            "name": "padding1",
            "docs": [
              "Reserved for future use"
            ],
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for the config account"
            ],
            "type": "u8"
          },
          {
            "name": "claimers",
            "docs": [
              "Claimers (payload is variable-length at runtime)"
            ],
            "type": {
              "array": [
                "pubkey",
                1
              ]
            }
          },
          {
            "name": "bps",
            "docs": [
              "Claimer shares in basis points (aligned to `claimers`)"
            ],
            "type": {
              "array": [
                "u16",
                1
              ]
            }
          }
        ]
      }
    },
    {
      "name": "feeShareConfigHeader",
      "docs": [
        "Zero-copy header for fixed fields. This is the `T` in `AccountLoader<'info, T>`."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baseMint",
            "docs": [
              "Base mint public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "docs": [
              "Quote mint public key (currently only WSOL is supported)"
            ],
            "type": "pubkey"
          },
          {
            "name": "partner",
            "docs": [
              "Optional partner public"
            ],
            "type": "pubkey"
          },
          {
            "name": "partnerConfig",
            "docs": [
              "Optional partner config"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding0",
            "docs": [
              "Reserved for future use"
            ],
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "isInitFinalized",
            "docs": [
              "When this is `0` - it's initialization is not done yet (claim/update ixs will fail)"
            ],
            "type": "u8"
          },
          {
            "name": "isUpdateLocked",
            "docs": [
              "When this is `1` - config is locked for pending updates (claim ixs will fail)",
              "**AVOID** setting this manually, use update methods"
            ],
            "type": "u8"
          },
          {
            "name": "padding1",
            "docs": [
              "Reserved for future use"
            ],
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for the config account"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "forceClaimUserParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claimerIndex",
            "docs": [
              "Index of claimer in the config claimers array"
            ],
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "partnerAccumulatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "baseMint",
            "docs": [
              "Base mint"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "docs": [
              "Quote mint"
            ],
            "type": "pubkey"
          },
          {
            "name": "pool",
            "docs": [
              "Pool"
            ],
            "type": "pubkey"
          },
          {
            "name": "partnerConfig",
            "docs": [
              "Partner config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "partner",
            "docs": [
              "Partner wallet receiving share"
            ],
            "type": "pubkey"
          },
          {
            "name": "accumulated",
            "docs": [
              "Amount added to partner's pending balance in this claim (quote units)"
            ],
            "type": "u64"
          },
          {
            "name": "totalAccumulatedFees",
            "docs": [
              "Current pending balance available to claim (quote units)"
            ],
            "type": "u64"
          },
          {
            "name": "totalLifetimeAccumulatedFees",
            "docs": [
              "All-time accumulated into partner config before claims (quote units)"
            ],
            "type": "u128"
          },
          {
            "name": "protocol",
            "docs": [
              "Source protocol that yielded these fees"
            ],
            "type": {
              "defined": {
                "name": "claimProtocol"
              }
            }
          }
        ]
      }
    },
    {
      "name": "partnerConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalClaimedFees",
            "docs": [
              "Total claimed fees for the partner (cumulative, quote units)"
            ],
            "type": "u128"
          },
          {
            "name": "totalAccumulatedFees",
            "docs": [
              "Pending partner fees (sum of last protocol claims not yet claimed)"
            ],
            "type": "u64"
          },
          {
            "name": "totalLifetimeAccumulatedFees",
            "docs": [
              "All-time fees accumulated into the partner config (quote units)"
            ],
            "type": "u128"
          },
          {
            "name": "partner",
            "docs": [
              "Partner public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeCollectionMode",
            "docs": [
              "Partner fee collection mode (stored as u8; see [`PartnerFeeCollectionMode`])",
              "",
              "Defaults to 0 (CollectFromClaimers)."
            ],
            "type": "u8"
          },
          {
            "name": "feeCollectionPlatformBps",
            "docs": [
              "Partner fee collection bps from platform share (used for CollectFromPlatform and CollectFromAll)",
              "",
              "Defaults to 0."
            ],
            "type": "u16"
          },
          {
            "name": "padding1",
            "docs": [
              "Reserved for future use"
            ],
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for the config account"
            ],
            "type": "u8"
          },
          {
            "name": "bps",
            "docs": [
              "Partner share in basis points (before distribution to claimers)",
              "",
              "Updated name: **fee_collection_claimers_bps**"
            ],
            "type": "u16"
          },
          {
            "name": "padding0",
            "docs": [
              "Padding reserved for future use (8-byte aligned; kept for backwards-compatible account size)"
            ],
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "partnerConfigCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "admin",
            "docs": [
              "Admin that created the partner config"
            ],
            "type": "pubkey"
          },
          {
            "name": "partnerConfig",
            "docs": [
              "Partner config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "partner",
            "docs": [
              "Partner wallet associated with the config"
            ],
            "type": "pubkey"
          },
          {
            "name": "bps",
            "docs": [
              "Partner's fee share in basis points"
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "partnerConfigUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "admin",
            "docs": [
              "Admin that updated the partner config"
            ],
            "type": "pubkey"
          },
          {
            "name": "partnerConfig",
            "docs": [
              "Partner config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "partner",
            "docs": [
              "Partner wallet associated with the config"
            ],
            "type": "pubkey"
          },
          {
            "name": "oldBps",
            "docs": [
              "Previous partner BPS before update"
            ],
            "type": "u16"
          },
          {
            "name": "updatedBps",
            "docs": [
              "New partner BPS after update"
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "partnerConfigV2SnapshotEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "admin",
            "docs": [
              "Admin that updated the partner config"
            ],
            "type": "pubkey"
          },
          {
            "name": "partnerConfig",
            "docs": [
              "Partner config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "partner",
            "docs": [
              "Partner wallet associated with the config"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeCollectionMode",
            "docs": [
              "Partner fee collection mode"
            ],
            "type": "u8"
          },
          {
            "name": "feeCollectionPlatformBps",
            "docs": [
              "Partner fee collection platform bps"
            ],
            "type": "u16"
          },
          {
            "name": "feeCollectionClaimersBps",
            "docs": [
              "Partner fee collection claimers bps"
            ],
            "type": "u16"
          },
          {
            "name": "padding0",
            "docs": [
              "Padding reserved for future use (8-byte aligned; kept for backwards-compatible account size)"
            ],
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "platformAccumulatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "baseMint",
            "docs": [
              "Base mint"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "docs": [
              "Quote mint"
            ],
            "type": "pubkey"
          },
          {
            "name": "pool",
            "docs": [
              "Pool"
            ],
            "type": "pubkey"
          },
          {
            "name": "platformVault",
            "docs": [
              "Platform vault account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "accumulated",
            "docs": [
              "Amount added to platform's pending balance in this claim (quote units)"
            ],
            "type": "u64"
          },
          {
            "name": "totalAccumulatedFees",
            "docs": [
              "Current pending balance available to claim (quote units)"
            ],
            "type": "u64"
          },
          {
            "name": "totalLifetimeAccumulatedFees",
            "docs": [
              "All-time accumulated into platform config before claims (quote units)"
            ],
            "type": "u128"
          },
          {
            "name": "protocol",
            "docs": [
              "Source protocol that yielded these fees"
            ],
            "type": {
              "defined": {
                "name": "claimProtocol"
              }
            }
          }
        ]
      }
    },
    {
      "name": "platformClaimedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "platformVault",
            "docs": [
              "Platform vault account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "admin",
            "docs": [
              "Admin that initiated the claim"
            ],
            "type": "pubkey"
          },
          {
            "name": "claimed",
            "docs": [
              "Amount claimed from platform (quote units)"
            ],
            "type": "u64"
          },
          {
            "name": "totalClaimedFees",
            "docs": [
              "Cumulative amount the platform has claimed to date (quote units)"
            ],
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "programConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "Current program admin"
            ],
            "type": "pubkey"
          },
          {
            "name": "pendingAdmin",
            "docs": [
              "Optional pending admin awaiting confirmation"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "platformVault",
            "docs": [
              "Platform vault (receives bags fees)"
            ],
            "type": "pubkey"
          },
          {
            "name": "platformBps",
            "docs": [
              "Platform share in basis points (before distribution to partner)"
            ],
            "type": "u16"
          },
          {
            "name": "totalClaimedFees",
            "docs": [
              "Total claimed fees for the platform (cumulative, quote units)"
            ],
            "type": "u128"
          },
          {
            "name": "totalAccumulatedFees",
            "docs": [
              "Pending platform fees (sum of last protocol claims not yet claimed)"
            ],
            "type": "u64"
          },
          {
            "name": "totalLifetimeAccumulatedFees",
            "docs": [
              "All-time fees accumulated into the platform config (quote units)"
            ],
            "type": "u128"
          },
          {
            "name": "padding0",
            "docs": [
              "Reserved for future use (8-byte aligned)"
            ],
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "padding1",
            "docs": [
              "Reserved for future use (1-byte aligned)"
            ],
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "Bump for the PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "programConfigAdminUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "programConfig",
            "docs": [
              "Program config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "oldAdmin",
            "docs": [
              "Previous admin (before update)"
            ],
            "type": "pubkey"
          },
          {
            "name": "newAdmin",
            "docs": [
              "New admin (after update)"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "programConfigInitializedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "programConfig",
            "docs": [
              "Program config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "platformVault",
            "docs": [
              "Platform vault account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "platformBps",
            "docs": [
              "Platform share in basis points"
            ],
            "type": "u16"
          },
          {
            "name": "admin",
            "docs": [
              "Admin wallet that initialized the config"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "programConfigUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp (seconds) at emit"
            ],
            "type": "i64"
          },
          {
            "name": "programConfig",
            "docs": [
              "Program config account (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "newPlatformBps",
            "docs": [
              "Platform share in basis points (after update)"
            ],
            "type": "u16"
          },
          {
            "name": "oldPlatformBps",
            "docs": [
              "Previous platform share in basis points (before update)"
            ],
            "type": "u16"
          },
          {
            "name": "pendingAdmin",
            "docs": [
              "Pending admin (if any)"
            ],
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "updateFeeConfigParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bps",
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "finalizeUpdate",
            "docs": [
              "Whether the update is finalized.",
              "`true`: this is the final ix and wont be able to further update later",
              "`false`: this is not the final ix and can be updated again later"
            ],
            "type": "bool"
          },
          {
            "name": "fromIdx",
            "docs": [
              "The index of the claimer to update from"
            ],
            "type": "u8"
          },
          {
            "name": "toIdx",
            "docs": [
              "The index of the claimer to update to"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "updatePartnerConfigParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "updatePartnerFeeCollectionParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeCollectionMode",
            "docs": [
              "Partner fee collection mode"
            ],
            "type": "u8"
          },
          {
            "name": "feeCollectionPlatformBps",
            "docs": [
              "Partner fee collection bps from the platform pool."
            ],
            "type": "u16"
          },
          {
            "name": "feeCollectionClaimersBps",
            "docs": [
              "Partner fee collection claimers bps"
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "updateProgramConfigParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pendingAdmin",
            "docs": [
              "Pending admin to update (None = don't update)",
              "Pass in Pubkey::default() to clear"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "platformBps",
            "docs": [
              "Platform BPS to update (None = don't update)"
            ],
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    }
  ]
};
