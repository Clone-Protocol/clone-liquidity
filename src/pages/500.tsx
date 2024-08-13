'use client'
import { styled } from '@mui/system'
import { Container, Stack, Box, Typography } from '@mui/material'
import { FailedStatusBox } from '~/components/Common/TransactionStateSnackbar';
import SupportDiscordIcon from 'public/images/support-button-discord.svg'
import Image from 'next/image';
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error }) {

  return (
    <StyledSection>
      <Container>
        <Stack width='300px' direction='column' alignItems='center' justifyContent='center' margin='0 auto' mt='130px'>
          <Box mb='10px'><Typography fontSize='70px' fontWeight={600} color='#b5fdf9'>{':('}</Typography></Box>
          <Typography variant="p_lg" textAlign='center' color='#fff'>{`We’re sorry, an unexpected error has occurred. If the error persists after reloading, please join us on Discord for support.`}</Typography>
          <a href="https://discord.gg/BXAeVWdmmD" target='_blank' rel="noreferrer"><FailedStatusBox width='74px' mt='15px'><Image src={SupportDiscordIcon} alt='discord' /> <Typography variant='p'>Discord</Typography></FailedStatusBox></a>
        </Stack>
      </Container>
    </StyledSection>
  )
}

const StyledSection = styled('section')`
  max-width: 1085px;
  margin: 0 auto;
  color: #fff;
  ${(props) => props.theme.breakpoints.up('md')} {
    padding-top: 100px;
	}
  ${(props) => props.theme.breakpoints.down('md')} {
    padding: 50px 0px;
	}
`