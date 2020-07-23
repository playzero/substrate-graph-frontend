import React, { useEffect, Fragment, useState } from "react"

import fetch from "isomorphic-fetch"

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { WebSocketLink } from "@apollo/client/link/ws"

import { useQuery } from "@apollo/react-hooks"
import { useMutation, useSubscription, gql } from "@apollo/client"

import { Table, Grid, Button } from 'semantic-ui-react'

//
//
//

const link = new WebSocketLink({
	uri: 'ws://localhost:18080/v1/graphql',
	options: {
		reconnect: true,
		timeout: 30000,
		connectionParams: {
			headers: {
				"x-hasura-admin-secret": "i-am-not-secure"
			}
		}
	}
})

export const client = new ApolloClient({
	link: link,
	cache: new InMemoryCache({ addTypename: true }),
})

//
//
//

export const GET_BLOCKS = gql`
	query {
			blocks(order_by: {block_num: desc}, limit: 10) {
				id
				hash
				extrinsics_root
				ext
				digest
				block_num
			}
	}
`

export const GET_LAST_BLOCK = gql`
	subscription MyQuery {
		blocks(limit: 1, order_by: {block_num: desc}) {
			id
		}
	}
`

//
//
//

const Block = () => {

	const { loading, error, data } = useSubscription(GET_LAST_BLOCK)

	if (loading) return "loading..."
	if (error) return `error: ${error.message}`

	return (
		<Fragment>
			{
				data.blocks.map(block => (
						<span>{block.id}</span>
					))
			}
		</Fragment>
	)

}

const BlockList = () => {

	const { loading, error, data } = useQuery(GET_BLOCKS)

	if (loading) return "loading..."
	if (error) return `error: ${error.message}`

	return (
		<Table celled striped size='small'>
			<Table.Body>
				<Table.Row key={0}>
					<Table.Cell width={1} textAlign='left'>id</Table.Cell>
					<Table.Cell width={1} textAlign='left'>block_num</Table.Cell>
					<Table.Cell width={4} textAlign='left'>ext</Table.Cell>
					<Table.Cell width={4} textAlign='left'>extrinsics_root</Table.Cell>
				</Table.Row>
				{data.blocks.map( (blocks, index) => (
					<Table.Row key={index+1}>
						<Table.Cell width={1} textAlign='left'><h3>{blocks.id}</h3></Table.Cell>
						<Table.Cell width={1} textAlign='left'><h3>{blocks.block_num}</h3></Table.Cell>
						<Table.Cell width={4} textAlign='left'>{blocks.ext}</Table.Cell>
						<Table.Cell width={4} textAlign='left'>{blocks.extrinsics_root}</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	)

}

export default () =>
	<ApolloProvider client={client}>

		<h1>GraphQL — Last indexed Block: <Block/></h1>

		<Grid.Row>
			<h3>Recently indexed blocks</h3>
			<BlockList/>
		</Grid.Row>

	</ApolloProvider>
