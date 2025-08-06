/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bags_meteora_fee_claimer.json`.
 */
export type BagsMeteoraFeeClaimer = {
	address: 'FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi';
	metadata: {
		name: 'bagsMeteoraFeeClaimer';
		version: '0.0.1';
		spec: '0.1.0';
	};
	instructions: [
		{
			name: 'claimA';
			docs: ['Claim fees as claimer_a', '', '[dbc] -> [fee_authority]', '[fee_authority] -> [claimer_a] & [vault_b]', '[vault_a] -> [claimer_a]'];
			discriminator: [161, 169, 182, 105, 63, 187, 190, 46];
			accounts: [
				{
					name: 'claimerA';
					writable: true;
					signer: true;
				},
				{
					name: 'claimerB';
				},
				{
					name: 'feeAuthority';
					docs: ['(PDA) Fee authority account to be passed to meteora as fee claimer'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [102, 101, 101, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'feeAuthorityQuoteAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenQuoteProgram';
							},
							{
								kind: 'account';
								path: 'quoteMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'feeAuthorityBaseAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenBaseProgram';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'vaultA';
					docs: ['(PDA) Vault A state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'vaultB';
					docs: ['(PDA) Vault B state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'baseMint';
					docs: ['Mint of the bonding curve token'];
				},
				{
					name: 'quoteMint';
					docs: ['Mostly WSOL - this is the mint of the fees'];
				},
				{
					name: 'systemProgram';
					docs: ['Programs'];
					address: '11111111111111111111111111111111';
				},
				{
					name: 'tokenBaseProgram';
				},
				{
					name: 'tokenQuoteProgram';
				},
				{
					name: 'associatedTokenProgram';
					address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
				},
				{
					name: 'dbcProgram';
					docs: ['DBC Program'];
					address: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN';
				},
				{
					name: 'poolAuthority';
					docs: ['---------------- EXTRA ACCOUNTS FOR METEORA CPI ---------------------'];
					address: 'FhVo3mqL8PW5pH5U2CN4XE33DokiyZnUwuGpH2hmHLuM';
				},
				{
					name: 'config';
				},
				{
					name: 'pool';
					writable: true;
				},
				{
					name: 'baseVault';
					writable: true;
				},
				{
					name: 'quoteVault';
					docs: ['CHECK The vault token account for output token (checked in CPI)'];
					writable: true;
				},
				{
					name: 'dbcEventAuthority';
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
						];
						program: {
							kind: 'const';
							value: [
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
								73,
							];
						};
					};
				},
				{
					name: 'eventAuthority';
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
						];
					};
				},
				{
					name: 'program';
				},
			];
			args: [];
		},
		{
			name: 'claimB';
			docs: ['Claim fees as claimer_b', '', '[dbc] -> [fee_authority]', '[fee_authority] -> [claimer_b] & [vault_a]', '[vault_b] -> [claimer_b]'];
			discriminator: [213, 21, 159, 131, 21, 57, 2, 67];
			accounts: [
				{
					name: 'claimerB';
					writable: true;
					signer: true;
				},
				{
					name: 'claimerA';
				},
				{
					name: 'feeAuthority';
					docs: ['(PDA) Fee authority account to be passed to meteora as fee claimer'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [102, 101, 101, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'feeAuthorityQuoteAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenQuoteProgram';
							},
							{
								kind: 'account';
								path: 'quoteMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'feeAuthorityBaseAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenBaseProgram';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'vaultA';
					docs: ['(PDA) Vault A state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'vaultB';
					docs: ['(PDA) Vault B state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'baseMint';
					docs: ['Mint of the bonding curve token'];
				},
				{
					name: 'quoteMint';
					docs: ['Mostly WSOL - this is the mint of the fees'];
				},
				{
					name: 'systemProgram';
					docs: ['Programs'];
					address: '11111111111111111111111111111111';
				},
				{
					name: 'tokenBaseProgram';
				},
				{
					name: 'tokenQuoteProgram';
				},
				{
					name: 'associatedTokenProgram';
					address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
				},
				{
					name: 'dbcProgram';
					docs: ['DBC Program'];
					address: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN';
				},
				{
					name: 'poolAuthority';
					docs: ['---------------- EXTRA ACCOUNTS FOR METEORA CPI ---------------------'];
					address: 'FhVo3mqL8PW5pH5U2CN4XE33DokiyZnUwuGpH2hmHLuM';
				},
				{
					name: 'config';
				},
				{
					name: 'pool';
					writable: true;
				},
				{
					name: 'baseVault';
					writable: true;
				},
				{
					name: 'quoteVault';
					docs: ['CHECK The vault token account for output token (checked in CPI)'];
					writable: true;
				},
				{
					name: 'dbcEventAuthority';
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
						];
						program: {
							kind: 'const';
							value: [
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
								73,
							];
						};
					};
				},
				{
					name: 'eventAuthority';
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
						];
					};
				},
				{
					name: 'program';
				},
			];
			args: [];
		},
		{
			name: 'claimDammA';
			docs: ['Claim DAMM fees as claimer_a', '', '[damm] -> [fee_authority]', '[fee_authority] -> [claimer_a] & [vault_b]', '[vault_a] -> [claimer_a]'];
			discriminator: [23, 251, 214, 27, 55, 68, 16, 87];
			accounts: [
				{
					name: 'claimerA';
					writable: true;
					signer: true;
				},
				{
					name: 'claimerB';
				},
				{
					name: 'feeAuthority';
					docs: ['(PDA) Fee authority account to be passed to meteora as fee claimer'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [102, 101, 101, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'feeAuthorityQuoteAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenQuoteProgram';
							},
							{
								kind: 'account';
								path: 'quoteMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'feeAuthorityBaseAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenBaseProgram';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'vaultA';
					docs: ['(PDA) Vault A state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'vaultB';
					docs: ['(PDA) Vault B state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'baseMint';
					docs: ['Mint of the bonding curve token'];
				},
				{
					name: 'quoteMint';
					docs: ['Mostly WSOL - this is the mint of the fees'];
				},
				{
					name: 'systemProgram';
					docs: ['Programs'];
					address: '11111111111111111111111111111111';
				},
				{
					name: 'tokenBaseProgram';
				},
				{
					name: 'tokenQuoteProgram';
				},
				{
					name: 'associatedTokenProgram';
					address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
				},
				{
					name: 'dammProgram';
					address: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG';
				},
				{
					name: 'poolAuthority';
					docs: ['---------------- EXTRA ACCOUNTS FOR METEORA CPI ---------------------'];
					address: 'HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC';
				},
				{
					name: 'pool';
				},
				{
					name: 'position';
					writable: true;
				},
				{
					name: 'baseVault';
					writable: true;
				},
				{
					name: 'quoteVault';
					writable: true;
				},
				{
					name: 'positionNftAccount';
					docs: ['The token account for nft', ''];
				},
				{
					name: 'dammEventAuthority';
					address: '3rmHSu74h1ZcmAisVcWerTCiRDQbUrBKmcwptYGjHfet';
				},
				{
					name: 'eventAuthority';
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
						];
					};
				},
				{
					name: 'program';
				},
			];
			args: [];
		},
		{
			name: 'claimDammB';
			docs: ['Claim DAMM fees as claimer_a', '', '[damm] -> [fee_authority]', '[fee_authority] -> [claimer_b] & [vault_a]', '[vault_b] -> [claimer_b]'];
			discriminator: [85, 187, 79, 227, 148, 222, 169, 95];
			accounts: [
				{
					name: 'claimerB';
					writable: true;
					signer: true;
				},
				{
					name: 'claimerA';
				},
				{
					name: 'feeAuthority';
					docs: ['(PDA) Fee authority account to be passed to meteora as fee claimer'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [102, 101, 101, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'feeAuthorityQuoteAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenQuoteProgram';
							},
							{
								kind: 'account';
								path: 'quoteMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'feeAuthorityBaseAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenBaseProgram';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'vaultA';
					docs: ['(PDA) Vault A state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'vaultB';
					docs: ['(PDA) Vault B state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'baseMint';
					docs: ['Mint of the bonding curve token'];
				},
				{
					name: 'quoteMint';
					docs: ['Mostly WSOL - this is the mint of the fees'];
				},
				{
					name: 'systemProgram';
					docs: ['Programs'];
					address: '11111111111111111111111111111111';
				},
				{
					name: 'tokenBaseProgram';
				},
				{
					name: 'tokenQuoteProgram';
				},
				{
					name: 'associatedTokenProgram';
					address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
				},
				{
					name: 'dammProgram';
					address: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG';
				},
				{
					name: 'poolAuthority';
					docs: ['---------------- EXTRA ACCOUNTS FOR METEORA CPI ---------------------'];
					address: 'HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC';
				},
				{
					name: 'pool';
				},
				{
					name: 'position';
					writable: true;
				},
				{
					name: 'baseVault';
					writable: true;
				},
				{
					name: 'quoteVault';
					writable: true;
				},
				{
					name: 'positionNftAccount';
					docs: ['The token account for nft', ''];
				},
				{
					name: 'dammEventAuthority';
					address: '3rmHSu74h1ZcmAisVcWerTCiRDQbUrBKmcwptYGjHfet';
				},
				{
					name: 'eventAuthority';
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
						];
					};
				},
				{
					name: 'program';
				},
			];
			args: [];
		},
		{
			name: 'createFeeVaults';
			docs: ['Create fee vaults', '', 'Only an admin can create fee vaults'];
			discriminator: [40, 216, 239, 141, 127, 220, 173, 221];
			accounts: [
				{
					name: 'payer';
					docs: ['Payer for the creation of the vaults (can be same as authority)'];
					writable: true;
					signer: true;
				},
				{
					name: 'authority';
				},
				{
					name: 'claimerA';
					docs: ['Claimer A account'];
				},
				{
					name: 'claimerB';
					docs: ['Claimer B account'];
				},
				{
					name: 'vaultA';
					docs: ['(PDA) Vault A state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'vaultB';
					docs: ['(PDA) Vault B state account'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [118, 97, 117, 108, 116];
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'feeAuthority';
					docs: ['(PDA) Fee authority account to be passed to meteora as fee claimer'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [102, 101, 101, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'feeAuthorityQuoteAta';
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'account';
								path: 'feeAuthority';
							},
							{
								kind: 'account';
								path: 'tokenProgram';
							},
							{
								kind: 'account';
								path: 'quoteMint';
							},
						];
						program: {
							kind: 'const';
							value: [
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
								89,
							];
						};
					};
				},
				{
					name: 'baseMint';
					docs: ['base mint of the bonding curve token'];
				},
				{
					name: 'quoteMint';
					docs: ['quote mint of the bonding curve token (WSOL)'];
				},
				{
					name: 'systemProgram';
					docs: ['Programs'];
					address: '11111111111111111111111111111111';
				},
				{
					name: 'tokenProgram';
				},
				{
					name: 'associatedTokenProgram';
					address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
				},
				{
					name: 'eventAuthority';
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
						];
					};
				},
				{
					name: 'program';
				},
			];
			args: [
				{
					name: 'input';
					type: {
						defined: {
							name: 'createFeeVaultsParameters';
						};
					};
				},
			];
		},
		{
			name: 'tweakFeeVaults';
			docs: ['Create fee vaults settings (bps)', '', 'Only an admin can change fee vaults settings'];
			discriminator: [237, 183, 240, 142, 11, 228, 143, 234];
			accounts: [
				{
					name: 'payer';
					docs: ['Payer for the creation of the vaults (can be same as authority)'];
					writable: true;
					signer: true;
				},
				{
					name: 'authority';
					docs: ['Authority allowed to tweak fee vaults'];
					signer: true;
				},
				{
					name: 'feeAuthority';
					docs: ['(PDA) Fee authority account to be passed to meteora as fee claimer'];
					writable: true;
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [102, 101, 101, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
							{
								kind: 'account';
								path: 'claimerA';
							},
							{
								kind: 'account';
								path: 'claimerB';
							},
							{
								kind: 'account';
								path: 'baseMint';
							},
						];
					};
				},
				{
					name: 'claimerA';
					docs: ['Claimer A account'];
				},
				{
					name: 'claimerB';
					docs: ['Claimer B account'];
				},
				{
					name: 'baseMint';
					docs: ['base mint of the bonding curve token'];
				},
				{
					name: 'quoteMint';
					docs: ['quote mint of the bonding curve token (WSOL)'];
				},
				{
					name: 'systemProgram';
					docs: ['Programs'];
					address: '11111111111111111111111111111111';
				},
				{
					name: 'tokenProgram';
				},
				{
					name: 'eventAuthority';
					pda: {
						seeds: [
							{
								kind: 'const';
								value: [95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121];
							},
						];
					};
				},
				{
					name: 'program';
				},
			];
			args: [
				{
					name: 'input';
					type: {
						defined: {
							name: 'tweakFeeVaultsParameters';
						};
					};
				},
			];
		},
	];
	accounts: [
		{
			name: 'feeAuthority';
			discriminator: [135, 162, 91, 24, 156, 94, 193, 104];
		},
		{
			name: 'vault';
			discriminator: [211, 8, 232, 43, 2, 152, 117, 119];
		},
	];
	events: [
		{
			name: 'dammClaimedEvent';
			discriminator: [218, 142, 187, 210, 111, 192, 166, 237];
		},
		{
			name: 'dbcClaimedEvent';
			discriminator: [144, 46, 37, 27, 10, 171, 177, 31];
		},
		{
			name: 'feeVaultsCreatedEvent';
			discriminator: [29, 33, 12, 23, 95, 249, 238, 190];
		},
		{
			name: 'feeVaultsTweakedEvent';
			discriminator: [118, 193, 160, 81, 236, 170, 187, 139];
		},
	];
	errors: [
		{
			code: 6000;
			name: 'typeConversionFailed';
			msg: 'Type conversion failed';
		},
		{
			code: 6001;
			name: 'checkedCalculationOverflow';
			msg: 'Checked Calculation overflowed';
		},
		{
			code: 6002;
			name: 'invalidBps';
			msg: 'Invalid BPS provided, total of both should equal 100';
		},
		{
			code: 6003;
			name: 'unauthorized';
			msg: 'unauthorized';
		},
		{
			code: 6004;
			name: 'invalidClaimerOrdering';
			msg: 'Invalid ordering of claimers, claimer_a must be less than claimer_b';
		},
	];
	types: [
		{
			name: 'createFeeVaultsParameters';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'claimerABps';
						docs: ['% of the fee to claimer A'];
						type: 'u16';
					},
					{
						name: 'claimerBBps';
						docs: ['% of the fee to claimer B'];
						type: 'u16';
					},
				];
			};
		},
		{
			name: 'dammClaimedEvent';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'claimer';
						docs: ['Who initiated the claim'];
						type: 'pubkey';
					},
					{
						name: 'dammTotalFees';
						docs: ['The total fees claimed from Meteora DAMM by authority'];
						type: 'u64';
					},
					{
						name: 'claimerShare';
						docs: ['Claimer share from the just claimed fees'];
						type: 'u64';
					},
					{
						name: 'totalClaimerFees';
						docs: ["Total claimed (share + what's already in vault)"];
						type: 'u64';
					},
					{
						name: 'partnerShare';
						docs: ['Partner share from the just claimed fees'];
						type: 'u64';
					},
					{
						name: 'totalPartnerFees';
						docs: ['Total fees yet to be claimed by partner'];
						type: 'u64';
					},
				];
			};
		},
		{
			name: 'dbcClaimedEvent';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'claimer';
						docs: ['Who initiated the claim'];
						type: 'pubkey';
					},
					{
						name: 'dbcTotalFees';
						docs: ['The total fees claimed from Meteora DBC by authority'];
						type: 'u64';
					},
					{
						name: 'claimerShare';
						docs: ['Claimer share from the just claimed fees'];
						type: 'u64';
					},
					{
						name: 'totalClaimerFees';
						docs: ["Total claimed (share + what's already in vault)"];
						type: 'u64';
					},
					{
						name: 'partnerShare';
						docs: ['Partner share from the just claimed fees'];
						type: 'u64';
					},
					{
						name: 'totalPartnerFees';
						docs: ['Total fees yet to be claimed by partner'];
						type: 'u64';
					},
				];
			};
		},
		{
			name: 'feeAuthority';
			docs: ['Fee authority to be passed to meteora to claim all fees and distribute them to the claimers', 'according to saved BPS set on initialization.'];
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'claimerA';
						type: 'pubkey';
					},
					{
						name: 'claimerB';
						type: 'pubkey';
					},
					{
						name: 'claimerABps';
						type: 'u16';
					},
					{
						name: 'claimerBBps';
						type: 'u16';
					},
					{
						name: 'mint';
						type: 'pubkey';
					},
					{
						name: 'bump';
						type: 'u8';
					},
				];
			};
		},
		{
			name: 'feeVaultsCreatedEvent';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'feeAuthority';
						type: 'pubkey';
					},
					{
						name: 'baseMint';
						type: 'pubkey';
					},
					{
						name: 'claimerA';
						type: 'pubkey';
					},
					{
						name: 'claimerB';
						type: 'pubkey';
					},
					{
						name: 'claimerABps';
						type: 'u16';
					},
					{
						name: 'claimerBBps';
						type: 'u16';
					},
				];
			};
		},
		{
			name: 'feeVaultsTweakedEvent';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'feeAuthority';
						type: 'pubkey';
					},
					{
						name: 'baseMint';
						type: 'pubkey';
					},
					{
						name: 'claimerA';
						type: 'pubkey';
					},
					{
						name: 'claimerB';
						type: 'pubkey';
					},
					{
						name: 'oldClaimerABps';
						type: 'u16';
					},
					{
						name: 'oldClaimerBBps';
						type: 'u16';
					},
					{
						name: 'claimerABps';
						type: 'u16';
					},
					{
						name: 'claimerBBps';
						type: 'u16';
					},
				];
			};
		},
		{
			name: 'tweakFeeVaultsParameters';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'claimerABps';
						docs: ['% of the fee to claimer A'];
						type: 'u16';
					},
					{
						name: 'claimerBBps';
						docs: ['% of the fee to claimer B'];
						type: 'u16';
					},
				];
			};
		},
		{
			name: 'vault';
			docs: ['Vault that is storing the fees'];
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						docs: ['Fee authority on this vault'];
						type: 'pubkey';
					},
					{
						name: 'claimer';
						docs: ['Claimer of the fees'];
						type: 'pubkey';
					},
					{
						name: 'bump';
						docs: ['Bump seed for the vault account'];
						type: 'u8';
					},
				];
			};
		},
	];
};
