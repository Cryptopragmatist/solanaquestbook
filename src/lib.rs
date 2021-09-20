use borsh::{BorshDeserialize, BorshSerialize};
use std::collections::HashMap;
use std::convert::TryInto;

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CampaignAccount {
    pub campaign_owner: Pubkey,
    pub campaign_amount: u64,
    pub campaign_description: String,
    pub campaign_fulfilled: u64,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey, // program identifier , needed to call the program and for solana to execute
    accounts: &[AccountInfo], //list of accounts involved
    data: &[u8], // input/instructions
) -> ProgramResult {
   
    let accounts_iter = &mut accounts.iter(); //get the account of the program caller 
    let campaign_account = next_account_info(accounts_iter)?; //the 1st account in the array will be the owner of the campaign and can withdraw the funds later

    //To differentiate between the operation we want to execute, we’ll send an identifier in the data parameter.

    let (instruction_byte, rest_of_data) = data.split_first().unwrap(); //split the data to unwrap the input

    let amount = rest_of_data //describes the amount needed by the campaign using the next 4 bytes after the first byte which is the operation code-
      .get(..8) //
      .and_then(|slice| slice.try_into().ok())
      .map(u64::from_le_bytes)
      .unwrap();
      
    let description = String::from_utf8(rest_of_data[9..].to_vec()).unwrap();  //unwraps the rest of the bytedata and turns into the campaign description    

    if *instruction_byte == 0 { //create campaign
      let campaign_owner_account = next_account_info(accounts_iter)?; 
      let mut campaign_account_data = CampaignAccount::try_from_slice(&campaign_account.data.borrow())?; // add CampaignAccount data to the mutable var campaign_account_data
      campaign_account_data.campaign_owner = *campaign_owner_account.owner; // adding acc owner tot he data
      campaign_account_data.campaign_amount = amount; // adding amount to the data
      campaign_account_data.campaign_description = description; // adding description to the data
      campaign_account_data.campaign_fulfilled = 0; // adding status to the data
      campaign_account_data.serialize(&mut &mut campaign_account.data.borrow_mut()[..])?; //serialize the data and store it to the acc so that it stays
    }

    if *instruction_byte == 1 { //fund a campaign
      //get campaign status 

      let mut campaign_account_data = CampaignAccount::try_from_slice(&campaign_account.data.borrow())?;
      msg!("{}",campaign_account_data.campaign_amount - campaign_account_data.campaign_fulfilled);

    }

    if *instruction_byte == 2 { //how much fund left to reach campaign funding

    }

    if *instruction_byte == 3 { //withdraw all collected funds and close campaign

    }
    

    Ok(())
}