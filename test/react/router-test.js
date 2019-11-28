import React from 'react'
import {expect} from 'chai'
import {stub} from 'sinon'
import {configure, shallow} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import {Router, Route, Link, useRoute} from '../../src/react/router'

describe(`react integration`, function() {

	before(function() {
		configure({ adapter: new Adapter() })
	})

	describe(`<Router />`, function() {

		it(`renders children`, function() {
			const wrapper = shallow(<Router><div /></Router>)
			expect(wrapper.html()).to.equal(`<div></div>`)
		})

		describe(`with useRoute`, function() {

			it(`provides the route data`, function() {
				const RouteUser = () => {
					const route = useRoute()

					return <div>{route.page}</div>
				}
				const wrapper = shallow(<Router route={{page: `page1`}}><RouteUser /></Router>)
				expect(wrapper.html()).to.equal(`<div>page1</div>`)
			})

		})

	})

	describe(`<Route />`, function() {

		it(`renders nothing when not matched`, function() {
			const wrapper = shallow(<App route={{page: `none`, data: {}, query: {}}} />)
			expect(wrapper.html()).to.equal(``)
		})

		it(`renders on a page match`, function() {
			const page1 = shallow(<App route={{page: `page1`, data: {}, query: {}}} />)
			expect(page1.html()).to.equal(`<div>page 1</div>`)

			const page2 = shallow(<App route={{page: `page2`, data: {}, query: {}}} />)
			expect(page2.html()).to.equal(`<div>page 2</div>`)
		})

		it(`renders on a data match`, function() {
			const page3true = shallow(<App route={{page: `page3`, data: {prop: true}, query: {}}} />)
			expect(page3true.html()).to.equal(`<div>page 3 w/ true</div>`)

			const page3false = shallow(<App route={{page: `page3`, data: {prop: false}, query: {}}} />)
			expect(page3false.html()).to.equal(`<div>page 3 w/ false</div>`)
		})

		it(`renders on a query match`, function() {
			const page4true = shallow(<App route={{page: `page4`, data: {}, query: {prop: true}}} />)
			expect(page4true.html()).to.equal(`<div>page 4 w/ true</div>`)

			const page4false = shallow(<App route={{page: `page4`, data: {}, query: {prop: false}}} />)
			expect(page4false.html()).to.equal(`<div>page 4 w/ false</div>`)
		})

		it(`renders on a function match`, function() {
			const dataTrue = shallow(<App route={{page: `no page`, data: {prop: `test`}, query: {}}} />)
			expect(dataTrue.html()).to.equal(`<div>data or query match</div>`)

			const queryTrue = shallow(<App route={{page: `other page`, data: {}, query: {prop: `test`}}} />)
			expect(queryTrue.html()).to.equal(`<div>data or query match</div>`)
		})

	})

	describe(`<Link />`, function() {

		beforeEach(function() {
			this.toUrl = stub()
			this.toUrl.withArgs({page: `page1`}).returns(`/page1`)
			this.toUrl.withArgs({page: `page2`, data: {id: 1}}).returns(`/page2/1`)
			this.toUrl.withArgs({page: `page2`, data: {id: 5}}).returns(`/page2/5`)
			this.toUrl.withArgs({page: `page3`, query: {id: 1}}).returns(`/page3?id=1`)
			this.toUrl.withArgs({page: `page3`, query: {id: 5}}).returns(`/page3?id=5`)
			this.toUrl.withArgs({page: `page4`}).returns(`/page4`)
		})

		it(`renders a page link`, function() {
			const wrapper = shallow(<Router route={{page: `page4`, toUrl: this.toUrl}}>
				<Link to="page1">Page 1</Link>
			</Router>)

			expect(wrapper.html()).to.equal(`<a href="/page1">Page 1</a>`)
		})

		it(`renders a page / data link`, function() {
			const wrapper = shallow(<Router route={{page: `page4`, toUrl: this.toUrl}}>
				<Link to={{page: `page2`, data: {id: 1}}}>Page 2/1</Link>
				<Link to={{page: `page2`, data: {id: 5}}}>Page 2/5</Link>
			</Router>)

			expect(wrapper.html()).to.equal(`<a href="/page2/1">Page 2/1</a><a href="/page2/5">Page 2/5</a>`)
		})

		it(`renders a page / query link`, function() {
			const wrapper = shallow(<Router route={{page: `page4`, toUrl: this.toUrl}}>
				<Link to={{page: `page3`, query: {id: 1}}}>Page 3?1</Link>
				<Link to={{page: `page3`, query: {id: 5}}}>Page 3?5</Link>
			</Router>)

			expect(wrapper.html()).to.equal(`<a href="/page3?id=1">Page 3?1</a><a href="/page3?id=5">Page 3?5</a>`)
		})

		it(`renders an active link`, function() {
			const wrapper = shallow(<Router route={{page: `page4`, toUrl: this.toUrl}}>
				<Link className="test-link" activeClassName="test-active" to="page1">Page 1</Link>
				<Link className="test-link" activeClassName="test-active" to="page4">Page 4</Link>
			</Router>)

			expect(wrapper.html()).to.equal(`<a class="test-link" href="/page1">Page 1</a><a class="test-link test-active" href="/page4">Page 4</a>`)
		})

	})

})

const App = ({route}) => {
	return <Router route={route}>
		<Route match="page1">
			<div>page 1</div>
		</Route>
		<Route match="page2">
			<div>page 2</div>
		</Route>

		<Route match={{page: `page3`, data: {prop: true}}}>
			<div>page 3 w/ true</div>
		</Route>
		<Route match={{page: `page3`, data: {prop: false}}}>
			<div>page 3 w/ false</div>
		</Route>

		<Route match={{page: `page4`, query: {prop: true}}}>
			<div>page 4 w/ true</div>
		</Route>
		<Route match={{page: `page4`, query: {prop: false}}}>
			<div>page 4 w/ false</div>
		</Route>

		<Route match={({data, query}) => (data.prop || query.prop) === `test`}>
			<div>data or query match</div>
		</Route>
	</Router>
}