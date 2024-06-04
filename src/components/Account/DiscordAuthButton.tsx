import { Box, Button, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import React from 'react';
import { styled } from '@mui/material/styles'
import { discordUsername } from '~/features/globalAtom';
import DiscordIcon from 'public/images/more/discord.svg'
import Image from 'next/image';

const DiscordAuthButton = () => {
  const discordUsernameValue = useAtomValue(discordUsername)

  const discordLogin = async () => {
    const url = process.env.NEXT_PUBLIC_DISCORD_OAUTH_URL || '';

    window.location.href = url;
  };

  const buttonStyle = {
    color: 'white',
    fontSize: '12px',
    padding: '4px',
    width: '180px',
    borderRadius: '5px',
    border: '1px solid white',
  };

  return !discordUsernameValue ?
    <LinkButton onClick={discordLogin} style={buttonStyle} >
      <Typography variant='p'>Link your Discord account</Typography>
      <Image src={DiscordIcon} alt="discord" />
    </LinkButton>
    : <Box><Typography variant='p'>Signed with Discord</Typography></Box>
};

const LinkButton = styled(Button)`
  display: flex;
  gap: 5px;
  align-items: center;
  &:hover {
    background: #000;
  }
      `

export default DiscordAuthButton;